import { pool } from '../db/connectDB.js';

const Calculator = {
  // Get a product by ID
  getProductById: async (productId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        supplier_id,
        name,
        code,
        is_active
      FROM supplier_products
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [productId],
    );

    return rows[0] || null;
  },

  // Get the base door price for a specific size
  getBlockPriceBySize: async (productId, width, height) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        min_height,
        max_height,
        min_width,
        max_width,
        price,
        currency
      FROM product_size_prices
      WHERE product_id = ?
        AND min_height <= ?
        AND max_height >= ?
        AND min_width <= ?
        AND max_width >= ?
        AND is_active = 1
      ORDER BY min_height ASC, min_width ASC
      LIMIT 1
      `,
      [productId, height, height, width, width],
    );

    return rows[0] || null;
  },

  // Get all active options for a product
  getProductOptions: async (productId, category = null) => {
    let query = `
      SELECT
        id,
        product_id,
        name,
        code,
        category,
        pricing_type,
        price,
        currency,
        is_active
      FROM product_options
      WHERE product_id = ?
        AND is_active = 1
    `;

    const params = [productId];

    if (category) {
      query += `
        AND category = ?
      `;

      params.push(category);
    }

    query += `
      ORDER BY id ASC
    `;

    const [rows] = await pool.execute(query, params);

    return rows;
  },

  // Get one active option by ID
  getProductOptionById: async (optionId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        name,
        code,
        category,
        pricing_type,
        price,
        currency,
        is_active
      FROM product_options
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [optionId],
    );

    return rows[0] || null;
  },

  // Get one active service by ID
  getProductServiceById: async (serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        name,
        code,
        pricing_type,
        price,
        currency,
        is_active
      FROM product_services
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [serviceId],
    );

    return rows[0] || null;
  },

  // Get all active services for a product
  getProductServices: async (productId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        name,
        code,
        pricing_type,
        price,
        currency,
        is_active
      FROM product_services
      WHERE product_id = ?
        AND is_active = 1
      ORDER BY id ASC
      `,
      [productId],
    );

    return rows;
  },

  // Get the installation service for a product
  getInstallationServiceByProductId: async (productId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        name,
        code,
        pricing_type,
        price,
        currency,
        is_active
      FROM product_services
      WHERE product_id = ?
        AND code = 'INSTALLATION'
        AND is_active = 1
      LIMIT 1
      `,
      [productId],
    );

    return rows[0] || null;
  },

  // Get a service price for a specific size
  getServicePriceBySize: async (serviceId, width, height) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        min_height,
        max_height,
        min_width,
        max_width,
        price,
        currency,
        is_active
      FROM product_service_size_prices
      WHERE service_id = ?
        AND min_height <= ?
        AND max_height >= ?
        AND min_width <= ?
        AND max_width >= ?
        AND is_active = 1
      ORDER BY min_height ASC, min_width ASC
      LIMIT 1
      `,
      [serviceId, height, height, width, width],
    );

    return rows[0] || null;
  },

  // Get a service price by rule code
  getServicePriceByRule: async (serviceId, ruleCode) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        rule_code,
        price,
        currency,
        is_active
      FROM product_service_rules
      WHERE service_id = ?
        AND rule_code = ?
        AND is_active = 1
      LIMIT 1
      `,
      [serviceId, ruleCode],
    );

    return rows[0] || null;
  },

  // Get all active rules for a service
  getServiceRules: async (serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        rule_code,
        price,
        currency,
        is_active
      FROM product_service_rules
      WHERE service_id = ?
        AND is_active = 1
      ORDER BY id ASC
      `,
      [serviceId],
    );

    return rows;
  },

  // Get all active size prices for a service
  getServiceSizePrices: async (serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        min_height,
        max_height,
        min_width,
        max_width,
        price,
        currency,
        is_active
      FROM product_service_size_prices
      WHERE service_id = ?
        AND is_active = 1
      ORDER BY min_height ASC, min_width ASC
      `,
      [serviceId],
    );

    return rows;
  },

  // Get a calculator item by ID
  getCalculatorItemById: async (calculatorItemId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        title,
        side_a_option_id,
        side_b_option_id,
        profile_finish_option_id,
        installation_enabled,
        vat,
        eur_rate,
        created_at
      FROM calculator_items
      WHERE id = ?
      LIMIT 1
      `,
      [calculatorItemId],
    );

    return rows[0] || null;
  },

  // Get calculator items for a product
  getCalculatorItemsByProductId: async (productId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        product_id,
        title,
        side_a_option_id,
        side_b_option_id,
        profile_finish_option_id,
        installation_enabled,
        vat,
        eur_rate,
        created_at
      FROM calculator_items
      WHERE product_id = ?
      ORDER BY created_at DESC, id DESC
      `,
      [productId],
    );

    return rows;
  },

  // Get one door variant by ID
  getDoorVariantById: async (variantId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        calculator_item_id,
        variant_number,
        door_code,
        quantity,
        room,
        leaf_width,
        leaf_height,
        opening_width,
        opening_height,
        lock_code,
        handle_code,
        ventilation_code,
        lock_option_id,
        handle_option_id,
        ventilation_option_id,
        created_at
      FROM door_variants
      WHERE id = ?
      LIMIT 1
      `,
      [variantId],
    );

    return rows[0] || null;
  },

  // Get all variants for a calculator item
  getDoorVariantsByCalculatorItemId: async (calculatorItemId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        calculator_item_id,
        variant_number,
        door_code,
        quantity,
        room,
        leaf_width,
        leaf_height,
        opening_width,
        opening_height,
        lock_code,
        handle_code,
        ventilation_code,
        lock_option_id,
        handle_option_id,
        ventilation_option_id,
        created_at
      FROM door_variants
      WHERE calculator_item_id = ?
      ORDER BY variant_number ASC, id ASC
      `,
      [calculatorItemId],
    );

    return rows;
  },

  // Get both sides of a door variant
  getDoorVariantSides: async (doorVariantId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvs.id,
        dvs.door_variant_id,
        dvs.side,
        dvs.option_id,
        po.name AS option_name,
        po.code AS option_code,
        po.category AS option_category,
        po.pricing_type,
        po.price,
        po.currency
      FROM door_variant_sides AS dvs
      INNER JOIN product_options AS po
        ON po.id = dvs.option_id
      WHERE dvs.door_variant_id = ?
      ORDER BY dvs.side ASC
      `,
      [doorVariantId],
    );

    return rows;
  },

  // Get one side of a door variant
  getDoorVariantSide: async (doorVariantId, side) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvs.id,
        dvs.door_variant_id,
        dvs.side,
        dvs.option_id,
        po.name AS option_name,
        po.code AS option_code,
        po.category AS option_category,
        po.pricing_type,
        po.price,
        po.currency
      FROM door_variant_sides AS dvs
      INNER JOIN product_options AS po
        ON po.id = dvs.option_id
      WHERE dvs.door_variant_id = ?
        AND dvs.side = ?
      LIMIT 1
      `,
      [doorVariantId, side],
    );

    return rows[0] || null;
  },

  // Get all services assigned to a door variant
  getDoorVariantOptions: async (doorVariantId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvo.id,
        dvo.door_variant_id,
        dvo.service_id,
        dvo.rule_code,
        dvo.quantity,
        ps.name AS service_name,
        ps.code AS service_code,
        ps.pricing_type,
        ps.price,
        ps.currency
      FROM door_variant_options AS dvo
      INNER JOIN product_services AS ps
        ON ps.id = dvo.service_id
      WHERE dvo.door_variant_id = ?
        AND ps.is_active = 1
      ORDER BY dvo.id ASC
      `,
      [doorVariantId],
    );

    return rows;
  },

  // Get one service assigned to a door variant
  getDoorVariantOption: async (doorVariantId, serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvo.id,
        dvo.door_variant_id,
        dvo.service_id,
        dvo.rule_code,
        dvo.quantity,
        ps.name AS service_name,
        ps.code AS service_code,
        ps.pricing_type,
        ps.price,
        ps.currency
      FROM door_variant_options AS dvo
      INNER JOIN product_services AS ps
        ON ps.id = dvo.service_id
      WHERE dvo.door_variant_id = ?
        AND dvo.service_id = ?
        AND ps.is_active = 1
      LIMIT 1
      `,
      [doorVariantId, serviceId],
    );

    return rows[0] || null;
  },

  // Create a calculator item
  createCalculatorItem: async (connection, data) => {
    const {
      product_id,
      title,
      side_a_option_id = null,
      side_b_option_id = null,
      profile_finish_option_id = null,
      installation_enabled,
      vat,
      eur_rate = null,
    } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO calculator_items
      (
        product_id,
        title,
        side_a_option_id,
        side_b_option_id,
        profile_finish_option_id,
        installation_enabled,
        vat,
        eur_rate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        product_id,
        title,
        side_a_option_id,
        side_b_option_id,
        profile_finish_option_id,
        installation_enabled,
        vat,
        eur_rate,
      ],
    );

    return result.insertId;
  },

  // Create a door variant
  createDoorVariant: async (connection, data) => {
    const {
      calculator_item_id,
      variant_number,
      door_code,
      quantity,
      room = null,
      leaf_width,
      leaf_height,
      opening_width,
      opening_height,
      lock_code = null,
      handle_code = null,
      ventilation_code = null,
      lock_option_id = null,
      handle_option_id = null,
      ventilation_option_id = null,
    } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO door_variants
      (
        calculator_item_id,
        variant_number,
        door_code,
        quantity,
        room,
        leaf_width,
        leaf_height,
        opening_width,
        opening_height,
        lock_code,
        handle_code,
        ventilation_code,
        lock_option_id,
        handle_option_id,
        ventilation_option_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        calculator_item_id,
        variant_number,
        door_code,
        quantity,
        room,
        leaf_width,
        leaf_height,
        opening_width,
        opening_height,
        lock_code,
        handle_code,
        ventilation_code,
        lock_option_id,
        handle_option_id,
        ventilation_option_id,
      ],
    );

    return result.insertId;
  },

  // Create a side for a door variant
  createDoorVariantSide: async (connection, data) => {
    const { door_variant_id, side, option_id } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO door_variant_sides
      (
        door_variant_id,
        side,
        option_id
      )
      VALUES (?, ?, ?)
      `,
      [door_variant_id, side, option_id],
    );

    return result.insertId;
  },

  // Create a service for a door variant
  createDoorVariantOption: async (connection, data) => {
    const { door_variant_id, service_id, rule_code = null, quantity } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO door_variant_options
      (
        door_variant_id,
        service_id,
        rule_code,
        quantity
      )
      VALUES (?, ?, ?, ?)
      `,
      [door_variant_id, service_id, rule_code, quantity],
    );

    return result.insertId;
  },
};

export default Calculator;
