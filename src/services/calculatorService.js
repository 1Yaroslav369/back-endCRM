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
  const locks = await Calculator.getLockOptions(productId);
  const handles = await Calculator.getHandleOptions(productId);
  const ventilations = await Calculator.getVentilationOptions(productId);

  return {
    product,
    options,
    services,
    locks,
    handles,
    ventilations,
  };
};

// Check that a product option belongs to the selected product
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

// Check that a lock option belongs to the selected product
const validateLockBelongsToProduct = async (productId, lockOptionId) => {
  if (lockOptionId === null || lockOptionId === undefined) {
    return null;
  }

  const lock = await Calculator.getLockOptionById(lockOptionId);

  if (!lock) {
    throw new Error(`Lock option ${lockOptionId} not found`);
  }

  if (Number(lock.product_id) !== Number(productId)) {
    throw new Error(
      `Lock option ${lockOptionId} does not belong to product ${productId}`,
    );
  }

  if (!lock.is_active) {
    throw new Error(`Lock option ${lockOptionId} is inactive`);
  }

  return lock;
};

// Check that a handle option belongs to the selected product
const validateHandleBelongsToProduct = async (productId, handleOptionId) => {
  if (handleOptionId === null || handleOptionId === undefined) {
    return null;
  }

  const handle = await Calculator.getHandleOptionById(handleOptionId);

  if (!handle) {
    throw new Error(`Handle option ${handleOptionId} not found`);
  }

  if (Number(handle.product_id) !== Number(productId)) {
    throw new Error(
      `Handle option ${handleOptionId} does not belong to product ${productId}`,
    );
  }

  if (!handle.is_active) {
    throw new Error(`Handle option ${handleOptionId} is inactive`);
  }

  return handle;
};

// Check that a ventilation option belongs to the selected product
const validateVentilationBelongsToProduct = async (
  productId,
  ventilationOptionId,
) => {
  if (ventilationOptionId === null || ventilationOptionId === undefined) {
    return null;
  }

  const ventilation =
    await Calculator.getVentilationOptionById(ventilationOptionId);

  if (!ventilation) {
    throw new Error(`Ventilation option ${ventilationOptionId} not found`);
  }

  if (Number(ventilation.product_id) !== Number(productId)) {
    throw new Error(
      `Ventilation option ${ventilationOptionId} does not belong to product ${productId}`,
    );
  }

  if (!ventilation.is_active) {
    throw new Error(`Ventilation option ${ventilationOptionId} is inactive`);
  }

  return ventilation;
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
    throw new Error(`Service ${service.id} is inactive`);
  }

  const allowedPricingTypes = [
    'FIXED',
    'PER_PIECE',
    'PER_M2',
    'PER_METER',
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

// Validate percentage
const validatePercentage = (value, fieldName) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0 || number > 100) {
    throw new Error(`${fieldName} must be between 0 and 100`);
  }

  return number;
};

// Validate price
const validatePrice = (price, entityName) => {
  const number = Number(price);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Invalid price for ${entityName}`);
  }

  return number;
};

// Validate supported currency
const validateCurrency = (currency) => {
  if (!['EUR', 'UAH', 'PLN'].includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  return currency;
};

// Convert EUR to PLN
const convertEurToPln = (price, eurRate) => {
  const amount = validatePrice(price, 'EUR price');

  const rate = Number(eurRate);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('EUR to PLN exchange rate is required');
  }

  return amount * rate;
};

// Convert UAH to PLN
const convertUahToPln = (price, uahToPlnRate) => {
  const amount = validatePrice(price, 'UAH price');

  const rate = Number(uahToPlnRate);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('UAH to PLN exchange rate is required');
  }

  return amount * rate;
};

// Convert PLN to EUR
const convertPlnToEur = (price, eurRate) => {
  const amount = validatePrice(price, 'PLN price');

  const rate = Number(eurRate);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('EUR to PLN exchange rate is required');
  }

  return amount / rate;
};

// Convert any supported currency to PLN
const convertPriceToPln = (price, currency, eurRate, uahToPlnRate) => {
  validateCurrency(currency);

  if (currency === 'PLN') {
    return validatePrice(price, 'PLN price');
  }

  if (currency === 'EUR') {
    return convertEurToPln(price, eurRate);
  }

  if (currency === 'UAH') {
    return convertUahToPln(price, uahToPlnRate);
  }

  throw new Error(`Unsupported currency: ${currency}`);
};

// Calculate the mounting opening area
const calculateOpeningArea = (openingWidth, openingHeight) => {
  const validWidth = validatePositiveInteger(openingWidth, 'Opening width');

  const validHeight = validatePositiveInteger(openingHeight, 'Opening height');

  return (validWidth * validHeight) / 1_000_000;
};

// Calculate mounting opening dimensions
const calculateOpeningDimensions = (variant) => {
  const leafWidth = validatePositiveInteger(variant.leaf_width, 'Leaf width');

  const leafHeight = validatePositiveInteger(
    variant.leaf_height,
    'Leaf height',
  );

  const openingMode = variant.opening_mode || 'AUTO';

  if (!['AUTO', 'CUSTOM'].includes(openingMode)) {
    throw new Error('Opening mode must be AUTO or CUSTOM');
  }

  if (openingMode === 'AUTO') {
    return {
      opening_mode: 'AUTO',
      opening_width: leafWidth + 100,
      opening_height: leafHeight + 50,
    };
  }

  const openingWidth = validatePositiveInteger(
    variant.opening_width,
    'Opening width',
  );

  const openingHeight = validatePositiveInteger(
    variant.opening_height,
    'Opening height',
  );

  return {
    opening_mode: 'CUSTOM',
    opening_width: openingWidth,
    opening_height: openingHeight,
  };
};

// Find the base door price by product and size.
//
// Important:
// Profil 43 and Profil 55 are different products.
// Their prices are selected from product_size_prices
// by product_id + leaf width + opening height.
const validateDoorSize = async (productId, leafWidth, openingHeight) => {
  const validWidth = validatePositiveInteger(leafWidth, 'Leaf width');

  const validHeight = validatePositiveInteger(openingHeight, 'Opening height');

  const price = await Calculator.getBlockPriceBySize(
    productId,
    validWidth,
    validHeight,
  );

  if (!price) {
    throw new Error(
      `No price found for product ${productId} with leaf width ${validWidth} and opening height ${validHeight}`,
    );
  }

  validatePrice(price.price, `door size ${validWidth}x${validHeight}`);

  validateCurrency(price.currency);

  return price;
};

// Calculate the price of a product option
const calculateOptionPrice = (option, width, height, eurRate, uahToPlnRate) => {
  if (!option) {
    return 0;
  }

  let price;

  if (option.pricing_type === 'FIXED' || option.pricing_type === 'PER_PIECE') {
    price = Number(option.price);
  } else if (option.pricing_type === 'PER_M2') {
    const area = calculateOpeningArea(width, height);

    price = Number(option.price) * area;
  } else {
    throw new Error(`Unsupported option pricing type: ${option.pricing_type}`);
  }

  validatePrice(price, `option ${option.id}`);

  return convertPriceToPln(price, option.currency, eurRate, uahToPlnRate);
};

// Calculate lock price
const calculateLockPrice = (lock, quantity, eurRate, uahToPlnRate) => {
  if (!lock) {
    return 0;
  }

  const validQuantity = validatePositiveInteger(quantity, 'Lock quantity');

  const basePrice = validatePrice(lock.price, `lock ${lock.id}`);

  return convertPriceToPln(
    basePrice * validQuantity,
    lock.currency,
    eurRate,
    uahToPlnRate,
  );
};

// Calculate handle price
const calculateHandlePrice = (
  handle,
  quantity,
  customHandleCost,
  customHandleCurrency,
  eurRate,
  uahToPlnRate,
) => {
  const validQuantity = validatePositiveInteger(quantity, 'Handle quantity');

  let totalPrice = 0;

  if (handle) {
    const basePrice = validatePrice(handle.price, `handle ${handle.id}`);

    totalPrice += convertPriceToPln(
      basePrice * validQuantity,
      handle.currency,
      eurRate,
      uahToPlnRate,
    );
  }

  if (customHandleCost !== null && customHandleCost !== undefined) {
    const customCost = validatePrice(customHandleCost, 'Custom handle cost');

    totalPrice += convertPriceToPln(
      customCost * validQuantity,
      customHandleCurrency || 'EUR',
      eurRate,
      uahToPlnRate,
    );
  }

  return totalPrice;
};

// Calculate ventilation price
const calculateVentilationPrice = (
  ventilation,
  quantity,
  eurRate,
  uahToPlnRate,
) => {
  if (!ventilation) {
    return 0;
  }

  const validQuantity = validatePositiveInteger(
    quantity,
    'Ventilation quantity',
  );

  const basePrice = validatePrice(
    ventilation.price,
    `ventilation ${ventilation.id}`,
  );

  return convertPriceToPln(
    basePrice * validQuantity,
    ventilation.currency,
    eurRate,
    uahToPlnRate,
  );
};

// Calculate service price
const calculateServicePrice = async (
  service,
  width,
  height,
  quantity,
  eurRate,
  uahToPlnRate,
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

  if (
    service.pricing_type === 'FIXED' ||
    service.pricing_type === 'PER_PIECE'
  ) {
    const basePrice = validatePrice(service.price, `service ${service.id}`);

    return convertPriceToPln(
      basePrice * validQuantity,
      service.currency,
      eurRate,
      uahToPlnRate,
    );
  }

  if (service.pricing_type === 'PER_M2') {
    const area = calculateOpeningArea(width, height);

    const basePrice = validatePrice(service.price, `service ${service.id}`);

    return convertPriceToPln(
      basePrice * area * validQuantity,
      service.currency,
      eurRate,
      uahToPlnRate,
    );
  }

  if (service.pricing_type === 'PER_METER') {
    const validWidth = validatePositiveInteger(width, 'Service width');

    const basePrice = validatePrice(service.price, `service ${service.id}`);

    const meters = validWidth / 1000;

    return convertPriceToPln(
      basePrice * meters * validQuantity,
      service.currency,
      eurRate,
      uahToPlnRate,
    );
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

    return convertPriceToPln(
      basePrice * validQuantity,
      sizePrice.currency,
      eurRate,
      uahToPlnRate,
    );
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

    return convertPriceToPln(
      basePrice * validQuantity,
      rule.currency,
      eurRate,
      uahToPlnRate,
    );
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

// Calculate one door variant
const calculateVariant = async (
  productId,
  variant,
  profileFinishOption,
  installationService,
  eurRate,
  uahToPlnRate,
) => {
  const quantity = validatePositiveInteger(
    variant.quantity,
    'Variant quantity',
  );

  const { sideA, sideB } = validateVariantSides(variant.sides);

  const leafWidth = validatePositiveInteger(variant.leaf_width, 'Leaf width');

  const leafHeight = validatePositiveInteger(
    variant.leaf_height,
    'Leaf height',
  );

  const { opening_mode, opening_width, opening_height } =
    calculateOpeningDimensions(variant);

  /*
   * Base door price comes from the product's
   * size-price table.
   *
   * Profil 43:
   * 0-2100 opening height -> 205 EUR
   * 2101-2300 opening height -> 227 EUR
   *
   * Profil 55:
   * 0-2300 opening height -> 390 EUR
   * 2301-2500 opening height -> 410 EUR
   * 2501-2800 opening height -> 430 EUR
   *
   * The product_id determines which table rows
   * are used.
   */
  const leafPrice = await validateDoorSize(
    productId,
    leafWidth,
    opening_height,
  );

  const baseDoorPricePln = convertPriceToPln(
    leafPrice.price,
    leafPrice.currency,
    eurRate,
    uahToPlnRate,
  );

  let variantCostPln = baseDoorPricePln * quantity;

  const preparedSides = [];

  /*
   * Each door has exactly two sides.
   *
   * Filling prices are calculated independently
   * for side A and side B.
   */
  for (const side of [sideA, sideB]) {
    const option = await validateOptionBelongsToProduct(
      productId,
      side.option_id,
      'FILLING',
    );

    if (!option) {
      throw new Error(`Option is required for side ${side.side}`);
    }

    const sidePrice = calculateOptionPrice(
      option,
      opening_width,
      opening_height,
      eurRate,
      uahToPlnRate,
    );

    variantCostPln += sidePrice * quantity;

    preparedSides.push({
      side: side.side,
      option_id: option.id,
    });
  }

  // Calculate the selected lock
  const lock = await validateLockBelongsToProduct(
    productId,
    variant.lock_option_id,
  );

  if (lock) {
    variantCostPln += calculateLockPrice(lock, quantity, eurRate, uahToPlnRate);
  }

  // Calculate the selected handle
  // and optional custom handle cost.
  const handle = await validateHandleBelongsToProduct(
    productId,
    variant.handle_option_id,
  );

  variantCostPln += calculateHandlePrice(
    handle,
    quantity,
    variant.custom_handle_cost,
    variant.custom_handle_currency,
    eurRate,
    uahToPlnRate,
  );

  // Calculate ventilation
  const ventilation = await validateVentilationBelongsToProduct(
    productId,
    variant.ventilation_option_id,
  );

  if (ventilation) {
    variantCostPln += calculateVentilationPrice(
      ventilation,
      quantity,
      eurRate,
      uahToPlnRate,
    );
  }

  /*
   * Profile finish is a fixed price per door.
   *
   * Example:
   * RAL powder coating = 40 EUR per door.
   */
  if (profileFinishOption) {
    const profilePrice = calculateOptionPrice(
      profileFinishOption,
      1,
      1,
      eurRate,
      uahToPlnRate,
    );

    variantCostPln += profilePrice * quantity;
  }

  const preparedServices = [];

  // Calculate additional services
  for (const serviceData of variant.services || []) {
    const service = await validateServiceBelongsToProduct(
      productId,
      serviceData.service_id,
    );

    // Installation is controlled only by installation_enabled.
    if (service.code === 'INSTALLATION') {
      throw new Error(
        'INSTALLATION is managed by installation_enabled and cannot be added manually',
      );
    }

    // Quantity is defined per one door.
    const serviceQuantityPerDoor = validatePositiveNumber(
      serviceData.quantity,
      `Quantity for service ${service.id}`,
    );

    // Calculate total quantity for the whole variant.
    const serviceQuantity = serviceQuantityPerDoor * quantity;

    const ruleCode = serviceData.rule_code ?? null;

    /*
     * Dimension-dependent services use the mounting
     * opening dimensions.
     *
     * This applies to:
     * - PER_M2
     * - PER_METER
     * - BY_SIZE
     */
    const servicePrice = await calculateServicePrice(
      service,
      opening_width,
      opening_height,
      serviceQuantity,
      eurRate,
      uahToPlnRate,
      ruleCode,
    );

    variantCostPln += servicePrice;

    preparedServices.push({
      service_id: service.id,
      rule_code: ruleCode,
      quantity: serviceQuantityPerDoor,
    });
  }

  /*
   * Installation is added automatically when
   * installation_enabled = true.
   *
   * The installation service uses the mounting
   * opening dimensions.
   */
  if (installationService) {
    const installationPrice = await calculateServicePrice(
      installationService,
      opening_width,
      opening_height,
      quantity,
      eurRate,
      uahToPlnRate,
    );

    variantCostPln += installationPrice;

    preparedServices.push({
      service_id: installationService.id,
      rule_code: null,
      quantity,
    });
  }

  return {
    preparedVariant: {
      ...variant,

      quantity,

      leaf_width: leafWidth,
      leaf_height: leafHeight,

      opening_mode,
      opening_width,
      opening_height,

      price_pln: variantCostPln,

      sides: preparedSides,
      services: preparedServices,
    },

    totalCostPln: variantCostPln,
  };
};

// Update the total net price of an offer
const updateOfferTotal = async (connection, offerId) => {
  if (!offerId) {
    return null;
  }

  const [rows] = await connection.execute(
    `
    SELECT
      COALESCE(SUM(total_net_pln), 0) AS total_net_pln
    FROM calculator_items
    WHERE offer_id = ?
    `,
    [offerId],
  );

  const totalNetPln = Number(rows[0]?.total_net_pln || 0);

  await connection.execute(
    `
    UPDATE offers
    SET
      net_price = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
      AND is_archived = 0
    `,
    [Number(totalNetPln.toFixed(2)), offerId],
  );

  return Number(totalNetPln.toFixed(2));
};

// Create a calculator item
export const createCalculator = async (data) => {
  const {
    // Link the calculator item to an offer.
    // If no offer is provided, the calculator item
    // remains standalone.
    offer_id = null,

    product_id,
    title,
    side_a_option_id,
    side_b_option_id,
    profile_finish_option_id,
    installation_enabled = false,
    vat,
    eur_rate,
    uah_to_pln_rate,
    markup_percent = 0,
    discount_percent = 0,
    variants,
  } = data;

  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error('At least one door variant is required');
  }

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

  const markupPercent = validatePercentage(markup_percent, 'Markup percent');

  const discountPercent = validatePercentage(
    discount_percent,
    'Discount percent',
  );

  const vatRate = Number(vat);

  if (!Number.isFinite(vatRate) || ![0, 5, 8, 23].includes(vatRate)) {
    throw new Error('VAT must be 0, 5, 8 or 23');
  }

  const eurRate = Number(eur_rate);

  if (!Number.isFinite(eurRate) || eurRate <= 0) {
    throw new Error('EUR to PLN exchange rate is required');
  }

  let uahToPlnRate = uah_to_pln_rate ?? null;

  if (uahToPlnRate !== null) {
    uahToPlnRate = Number(uahToPlnRate);

    if (!Number.isFinite(uahToPlnRate) || uahToPlnRate <= 0) {
      throw new Error('UAH to PLN exchange rate must be greater than 0');
    }
  }

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

  const preparedVariants = [];

  let totalCostPln = 0;

  // Calculate every door variant separately.
  for (const variant of variants) {
    const result = await calculateVariant(
      product_id,
      variant,
      profileFinishOption,
      installationService,
      eurRate,
      uahToPlnRate,
    );

    totalCostPln += result.totalCostPln;

    preparedVariants.push(result.preparedVariant);
  }

  /*
   * All individual prices are already converted
   * to PLN.
   *
   * Therefore totalCostPln is the actual production
   * cost in PLN.
   */
  const totalCostEur = convertPlnToEur(totalCostPln, eurRate);

  // Add markup
  const markupAmountEur = totalCostEur * (markupPercent / 100);

  const totalBeforeDiscountEur = totalCostEur + markupAmountEur;

  // Apply customer discount
  const totalDiscountEur = totalBeforeDiscountEur * (discountPercent / 100);

  const totalNetEur = totalBeforeDiscountEur - totalDiscountEur;

  // Convert final net price back to PLN
  const totalNetPln = convertEurToPln(totalNetEur, eurRate);

  // Calculate VAT
  const vatAmountPln = totalNetPln * (vatRate / 100);

  const totalGrossPln = totalNetPln + vatAmountPln;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Create the calculator item
    const calculatorItemId = await Calculator.createCalculatorItem(connection, {
      // Link this calculator item to the offer.
      // Null means that the calculator item is standalone.
      offer_id,

      product_id,
      title,

      side_a_option_id: side_a_option_id ?? null,

      side_b_option_id: side_b_option_id ?? null,

      profile_finish_option_id: profile_finish_option_id ?? null,

      installation_enabled,

      vat: vatRate,

      eur_rate: eurRate,

      markup_percent: markupPercent,

      discount_percent: discountPercent,

      total_cost_eur: Number(totalCostEur.toFixed(2)),

      total_before_discount_eur: Number(totalBeforeDiscountEur.toFixed(2)),

      total_discount_eur: Number(totalDiscountEur.toFixed(2)),

      total_net_pln: Number(totalNetPln.toFixed(2)),

      vat_amount_pln: Number(vatAmountPln.toFixed(2)),

      total_gross_pln: Number(totalGrossPln.toFixed(2)),
    });

    const createdVariants = [];

    // Save every calculated variant.
    for (const variant of preparedVariants) {
      const variantId = await Calculator.createDoorVariant(connection, {
        calculator_item_id: calculatorItemId,

        variant_number: variant.variant_number,

        door_code: variant.door_code,

        quantity: variant.quantity,

        room: variant.room ?? null,

        leaf_width: variant.leaf_width,

        leaf_height: variant.leaf_height,

        opening_mode: variant.opening_mode,

        opening_width: variant.opening_width,

        opening_height: variant.opening_height,

        lock_code: variant.lock_code ?? null,

        handle_code: variant.handle_code ?? null,

        ventilation_code: variant.ventilation_code ?? null,

        lock_option_id: variant.lock_option_id ?? null,

        handle_option_id: variant.handle_option_id ?? null,

        ventilation_option_id: variant.ventilation_option_id ?? null,

        custom_handle_cost: variant.custom_handle_cost ?? null,

        custom_handle_currency: variant.custom_handle_currency ?? 'EUR',
      });

      // Save both sides of the door.
      for (const side of variant.sides) {
        await Calculator.createDoorVariantSide(connection, {
          door_variant_id: variantId,

          side: side.side,

          option_id: side.option_id,
        });
      }

      // Save all services assigned to the variant.
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

        leaf_width: variant.leaf_width,

        leaf_height: variant.leaf_height,

        opening_mode: variant.opening_mode,

        opening_width: variant.opening_width,

        opening_height: variant.opening_height,

        price_pln: Number(variant.price_pln.toFixed(2)),
      });
    }

    /*
     * If this calculator item belongs to an offer,
     * recalculate the offer total from all its
     * calculator items.
     *
     * This keeps offers.net_price synchronized
     * with the actual calculator positions.
     */
    let offerTotalNetPln = null;

    if (offer_id) {
      offerTotalNetPln = await updateOfferTotal(connection, offer_id);
    }

    await connection.commit();

    return {
      calculator_item_id: calculatorItemId,

      // Return the linked offer ID.
      offer_id,

      product_id,

      title,

      currency: 'PLN',

      vat: vatRate,

      eur_rate: eurRate,

      uah_to_pln_rate: uahToPlnRate,

      markup_percent: markupPercent,

      discount_percent: discountPercent,

      total_cost_eur: Number(totalCostEur.toFixed(2)),

      total_before_discount_eur: Number(totalBeforeDiscountEur.toFixed(2)),

      total_discount_eur: Number(totalDiscountEur.toFixed(2)),

      total_net_pln: Number(totalNetPln.toFixed(2)),

      vat_amount_pln: Number(vatAmountPln.toFixed(2)),

      total_gross_pln: Number(totalGrossPln.toFixed(2)),

      // Total net price of the entire offer.
      offer_total_net_pln: offerTotalNetPln,

      variants: createdVariants,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
