import Calculator from '../models/calculator.js';
import { pool } from '../db/connectDB.js';

// Get the calculator configuration for a product
export const getCalculatorConfig = async (productId) => {
  const product = await Calculator.getProductById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const options = await Calculator.getProductOptions(productId);
  const services = await Calculator.getProductServices(productId);

  return {
    product,
    options,
    services,
  };
};

// Check that an option belongs to the selected product
const validateOptionBelongsToProduct = async (
  productId,
  optionId,
  expectedCategory = null,
) => {
  if (optionId === null || optionId === undefined) {
    return null;
  }

  const option = await Calculator.getProductOptionById(optionId);

  if (!option) {
    throw new Error(`Option ${optionId} not found`);
  }

  if (Number(option.product_id) !== Number(productId)) {
    throw new Error(
      `Option ${optionId} does not belong to product ${productId}`,
    );
  }

  if (!option.is_active) {
    throw new Error(`Option ${optionId} is inactive`);
  }

  if (expectedCategory && option.category !== expectedCategory) {
    throw new Error(
      `Option ${optionId} must have category ${expectedCategory}`,
    );
  }

  return option;
};

// Check that a service belongs to the selected product
const validateServiceBelongsToProduct = async (productId, serviceId) => {
  if (serviceId === null || serviceId === undefined) {
    throw new Error('Service ID is required');
  }

  const service = await Calculator.getProductServiceById(serviceId);

  if (!service) {
    throw new Error(`Service ${serviceId} not found`);
  }

  if (Number(service.product_id) !== Number(productId)) {
    throw new Error(
      `Service ${serviceId} does not belong to product ${productId}`,
    );
  }

  if (!service.is_active) {
    throw new Error(`Service ${serviceId} is inactive`);
  }

  const allowedPricingTypes = [
    'FIXED',
    'PER_PIECE',
    'PER_M2',
    'BY_SIZE',
    'RULE',
  ];

  if (!allowedPricingTypes.includes(service.pricing_type)) {
    throw new Error(
      `Unsupported pricing type ${service.pricing_type} for service ${service.id}`,
    );
  }

  return service;
};

// Validate a positive number
const validatePositiveNumber = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }

  return number;
};

// Validate a positive integer
const validatePositiveInteger = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }

  return number;
};

// Validate a price
const validatePrice = (price, entityName) => {
  const number = Number(price);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Invalid price for ${entityName}`);
  }

  return number;
};

// Validate supported currency
const validateCurrency = (currency) => {
  if (currency !== 'UAH' && currency !== 'EUR') {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return currency;
};

// Find the base door price for the selected size
const validateDoorSize = async (productId, width, height) => {
  const validWidth = validatePositiveInteger(width, 'Door width');
  const validHeight = validatePositiveInteger(height, 'Door height');

  const price = await Calculator.getBlockPriceBySize(
    productId,
    validWidth,
    validHeight,
  );

  if (!price) {
    throw new Error(
      `No price found for product ${productId} with size ${validWidth}x${validHeight}`,
    );
  }

  validatePrice(price.price, `door size ${validWidth}x${validHeight}`);
  validateCurrency(price.currency);

  return price;
};

// Convert a price to UAH
const convertPriceToUah = (price, currency, eurRate) => {
  const amount = validatePrice(price, 'price');

  validateCurrency(currency);

  if (currency === 'UAH') {
    return amount;
  }

  const rate = Number(eurRate);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('EUR exchange rate is required for EUR prices');
  }

  return amount * rate;
};

// Calculate the price of an option
const calculateOptionPrice = (option, width, height, eurRate) => {
  if (!option) {
    return 0;
  }

  let price;

  if (option.pricing_type === 'FIXED' || option.pricing_type === 'PER_PIECE') {
    price = Number(option.price);
  } else if (option.pricing_type === 'PER_M2') {
    const validWidth = validatePositiveInteger(width, 'Option width');
    const validHeight = validatePositiveInteger(height, 'Option height');

    const area = (validWidth * validHeight) / 1_000_000;

    price = Number(option.price) * area;
  } else {
    throw new Error(`Unsupported option pricing type: ${option.pricing_type}`);
  }

  validatePrice(price, `option ${option.id}`);

  return convertPriceToUah(price, option.currency, eurRate);
};

// Calculate the price of a service
const calculateServicePrice = async (
  service,
  width,
  height,
  quantity,
  eurRate,
  ruleCode = null,
) => {
  const validQuantity = validatePositiveNumber(
    quantity,
    `Quantity for service ${service.id}`,
  );

  if (
    service.pricing_type !== 'RULE' &&
    ruleCode !== null &&
    ruleCode !== undefined
  ) {
    throw new Error(
      `rule_code can only be used with RULE service ${service.id}`,
    );
  }

  if (service.pricing_type === 'FIXED') {
    const basePrice = validatePrice(service.price, `service ${service.id}`);
    const price = basePrice * validQuantity;

    return convertPriceToUah(price, service.currency, eurRate);
  }

  if (service.pricing_type === 'PER_PIECE') {
    const basePrice = validatePrice(service.price, `service ${service.id}`);
    const price = basePrice * validQuantity;

    return convertPriceToUah(price, service.currency, eurRate);
  }

  if (service.pricing_type === 'PER_M2') {
    const validWidth = validatePositiveInteger(width, 'Service width');
    const validHeight = validatePositiveInteger(height, 'Service height');

    const area = (validWidth * validHeight) / 1_000_000;
    const basePrice = validatePrice(service.price, `service ${service.id}`);

    const price = basePrice * area * validQuantity;

    return convertPriceToUah(price, service.currency, eurRate);
  }

  if (service.pricing_type === 'BY_SIZE') {
    const validWidth = validatePositiveInteger(width, 'Service width');
    const validHeight = validatePositiveInteger(height, 'Service height');

    const sizePrice = await Calculator.getServicePriceBySize(
      service.id,
      validWidth,
      validHeight,
    );

    if (!sizePrice) {
      throw new Error(
        `No size price found for service ${service.id} with size ${validWidth}x${validHeight}`,
      );
    }

    const basePrice = validatePrice(
      sizePrice.price,
      `service ${service.id} size price`,
    );

    const price = basePrice * validQuantity;

    return convertPriceToUah(price, sizePrice.currency, eurRate);
  }

  if (service.pricing_type === 'RULE') {
    if (typeof ruleCode !== 'string' || ruleCode.trim() === '') {
      throw new Error(`Rule code is required for RULE service ${service.id}`);
    }

    const normalizedRuleCode = ruleCode.trim();

    const rule = await Calculator.getServicePriceByRule(
      service.id,
      normalizedRuleCode,
    );

    if (!rule) {
      throw new Error(
        `Rule ${normalizedRuleCode} not found for service ${service.id}`,
      );
    }

    const basePrice = validatePrice(rule.price, `rule ${normalizedRuleCode}`);

    const price = basePrice * validQuantity;

    return convertPriceToUah(price, rule.currency, eurRate);
  }

  throw new Error(`Unsupported service pricing type: ${service.pricing_type}`);
};

// Validate both sides of a door variant
const validateVariantSides = (sides) => {
  if (!Array.isArray(sides)) {
    throw new Error('Variant sides must be an array');
  }

  if (sides.length !== 2) {
    throw new Error('Each door variant must contain exactly two sides');
  }

  const sideA = sides.filter((side) => side.side === 'A');
  const sideB = sides.filter((side) => side.side === 'B');

  if (sideA.length !== 1 || sideB.length !== 1) {
    throw new Error(
      'Each door variant must contain exactly one A side and one B side',
    );
  }

  return {
    sideA: sideA[0],
    sideB: sideB[0],
  };
};

// Create a calculator item
export const createCalculator = async (data) => {
  const {
    product_id,
    title,
    side_a_option_id,
    side_b_option_id,
    profile_finish_option_id,
    installation_enabled,
    vat,
    eur_rate,
    variants,
  } = data;

  const product = await Calculator.getProductById(product_id);

  if (!product) {
    throw new Error('Product not found');
  }

  await validateOptionBelongsToProduct(product_id, side_a_option_id, 'FILLING');

  await validateOptionBelongsToProduct(product_id, side_b_option_id, 'FILLING');

  const profileFinishOption = await validateOptionBelongsToProduct(
    product_id,
    profile_finish_option_id,
    'PROFILE_FINISH',
  );

  let installationService = null;

  if (installation_enabled) {
    installationService =
      await Calculator.getInstallationServiceByProductId(product_id);

    if (!installationService) {
      throw new Error(
        `Installation service not found for product ${product_id}`,
      );
    }

    if (installationService.pricing_type !== 'BY_SIZE') {
      throw new Error('Installation service must use BY_SIZE pricing');
    }
  }

  let totalPrice = 0;
  const preparedVariants = [];

  for (const variant of variants) {
    const quantity = validatePositiveInteger(
      variant.quantity,
      'Variant quantity',
    );

    validateVariantSides(variant.sides);

    const leafPrice = await validateDoorSize(
      product_id,
      variant.leaf_width,
      variant.leaf_height,
    );

    await validateDoorSize(
      product_id,
      variant.opening_width,
      variant.opening_height,
    );

    const lockOption = await validateOptionBelongsToProduct(
      product_id,
      variant.lock_option_id,
      'LOCK',
    );

    const handleOption = await validateOptionBelongsToProduct(
      product_id,
      variant.handle_option_id,
      'HANDLE',
    );

    const ventilationOption = await validateOptionBelongsToProduct(
      product_id,
      variant.ventilation_option_id,
      'VENTILATION',
    );

    let variantPrice =
      convertPriceToUah(leafPrice.price, leafPrice.currency, eur_rate) *
      quantity;

    const preparedSides = [];

    for (const side of variant.sides) {
      const option = await validateOptionBelongsToProduct(
        product_id,
        side.option_id,
        'FILLING',
      );

      if (!option) {
        throw new Error(`Option is required for side ${side.side}`);
      }

      const sidePrice = calculateOptionPrice(
        option,
        variant.leaf_width,
        variant.leaf_height,
        eur_rate,
      );

      variantPrice += sidePrice * quantity;

      preparedSides.push({
        side: side.side,
        option_id: option.id,
      });
    }

    if (lockOption) {
      const lockPrice = calculateOptionPrice(
        lockOption,
        variant.leaf_width,
        variant.leaf_height,
        eur_rate,
      );

      variantPrice += lockPrice * quantity;
    }

    if (handleOption) {
      const handlePrice = calculateOptionPrice(
        handleOption,
        variant.leaf_width,
        variant.leaf_height,
        eur_rate,
      );

      variantPrice += handlePrice * quantity;
    }

    if (ventilationOption) {
      const ventilationPrice = calculateOptionPrice(
        ventilationOption,
        variant.leaf_width,
        variant.leaf_height,
        eur_rate,
      );

      variantPrice += ventilationPrice * quantity;
    }

    const preparedServices = [];

    for (const serviceData of variant.services) {
      const service = await validateServiceBelongsToProduct(
        product_id,
        serviceData.service_id,
      );

      if (service.code === 'INSTALLATION') {
        throw new Error(
          'INSTALLATION is managed by installation_enabled and cannot be added manually',
        );
      }

      const serviceQuantity = validatePositiveNumber(
        serviceData.quantity,
        `Quantity for service ${service.id}`,
      );

      const ruleCode = serviceData.rule_code ?? null;

      const servicePrice = await calculateServicePrice(
        service,
        variant.leaf_width,
        variant.leaf_height,
        serviceQuantity,
        eur_rate,
        ruleCode,
      );

      variantPrice += servicePrice;

      preparedServices.push({
        service_id: service.id,
        rule_code: ruleCode,
        quantity: serviceQuantity,
      });
    }

    if (installationService) {
      const installationPrice = await calculateServicePrice(
        installationService,
        variant.opening_width,
        variant.opening_height,
        quantity,
        eur_rate,
      );

      variantPrice += installationPrice;

      preparedServices.push({
        service_id: installationService.id,
        rule_code: null,
        quantity,
      });
    }

    totalPrice += variantPrice;

    preparedVariants.push({
      ...variant,
      quantity,
      price: variantPrice,
      sides: preparedSides,
      services: preparedServices,
    });
  }

  if (profileFinishOption) {
    const profilePrice = calculateOptionPrice(
      profileFinishOption,
      1,
      1,
      eur_rate,
    );

    totalPrice += profilePrice;
  }

  const vatRate = Number(vat);

  if (!Number.isFinite(vatRate) || ![0, 5, 8, 23].includes(vatRate)) {
    throw new Error('VAT must be 0, 5, 8 or 23');
  }

  const vatAmount = totalPrice * (vatRate / 100);
  const totalWithVat = totalPrice + vatAmount;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const calculatorItemId = await Calculator.createCalculatorItem(connection, {
      product_id,
      title,
      side_a_option_id: side_a_option_id ?? null,
      side_b_option_id: side_b_option_id ?? null,
      profile_finish_option_id: profile_finish_option_id ?? null,
      installation_enabled,
      vat,
      eur_rate: eur_rate ?? null,
    });

    const createdVariants = [];

    for (const variant of preparedVariants) {
      const variantId = await Calculator.createDoorVariant(connection, {
        calculator_item_id: calculatorItemId,
        variant_number: variant.variant_number,
        door_code: variant.door_code,
        quantity: variant.quantity,
        room: variant.room ?? null,
        leaf_width: variant.leaf_width,
        leaf_height: variant.leaf_height,
        opening_width: variant.opening_width,
        opening_height: variant.opening_height,
        lock_code: variant.lock_code ?? null,
        handle_code: variant.handle_code ?? null,
        ventilation_code: variant.ventilation_code ?? null,
        lock_option_id: variant.lock_option_id ?? null,
        handle_option_id: variant.handle_option_id ?? null,
        ventilation_option_id: variant.ventilation_option_id ?? null,
      });

      for (const side of variant.sides) {
        await Calculator.createDoorVariantSide(connection, {
          door_variant_id: variantId,
          side: side.side,
          option_id: side.option_id,
        });
      }

      for (const service of variant.services) {
        await Calculator.createDoorVariantOption(connection, {
          door_variant_id: variantId,
          service_id: service.service_id,
          rule_code: service.rule_code ?? null,
          quantity: service.quantity,
        });
      }

      createdVariants.push({
        id: variantId,
        variant_number: variant.variant_number,
        door_code: variant.door_code,
        quantity: variant.quantity,
        price: Number(variant.price.toFixed(2)),
      });
    }

    await connection.commit();

    return {
      calculator_item_id: calculatorItemId,
      product_id,
      title,
      currency: 'UAH',
      vat: vatRate,
      eur_rate: eur_rate ?? null,
      total_net: Number(totalPrice.toFixed(2)),
      vat_amount: Number(vatAmount.toFixed(2)),
      total_gross: Number(totalWithVat.toFixed(2)),
      variants: createdVariants,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
