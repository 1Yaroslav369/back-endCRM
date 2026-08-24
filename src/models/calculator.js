import { pool } from '../db/connectDB.js';

const Calculator = {
  // GET BLOCK PRICE BY PRODUCT AND SIZE
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

  // GET PRODUCT BY ID
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
  // GET PRODUCT OPTIONS
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
        currency
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

  // GET PRODUCT OPTION BY ID
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
        currency
      FROM product_options
      WHERE id = ?
        AND is_active = 1
      LIMIT 1
      `,
      [optionId],
    );

    return rows[0] || null;
  },

  // GET PRODUCT SERVICE BY ID
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

  // GET SERVICE PRICE BY SIZE
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
        currency
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

  // GET SERVICE PRICE BY RULE
  getServicePriceByRule: async (serviceId, ruleCode) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        rule_code,
        price,
        currency
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

  // GET PRODUCT SERVICES
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
        currency
      FROM product_services
      WHERE product_id = ?
        AND is_active = 1
      ORDER BY id ASC
      `,
      [productId],
    );

    return rows;
  },

  // GET ALL SERVICE RULES
  getServiceRules: async (serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        service_id,
        rule_code,
        price,
        currency
      FROM product_service_rules
      WHERE service_id = ?
        AND is_active = 1
      ORDER BY id ASC
      `,
      [serviceId],
    );

    return rows;
  },

  // GET ALL SERVICE SIZE PRICES
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
        currency
      FROM product_service_size_prices
      WHERE service_id = ?
        AND is_active = 1
      ORDER BY min_height ASC, min_width ASC
      `,
      [serviceId],
    );

    return rows;
  },

  // GET DOOR VARIANT BY ID
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
        created_at,
        lock_option_id,
        handle_option_id,
        ventilation_option_id
      FROM door_variants
      WHERE id = ?
      LIMIT 1
      `,
      [variantId],
    );

    return rows[0] || null;
  },

  // GET DOOR VARIANTS BY CALCULATOR ITEM
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
        created_at,
        lock_option_id,
        handle_option_id,
        ventilation_option_id
      FROM door_variants
      WHERE calculator_item_id = ?
      ORDER BY variant_number ASC, id ASC
      `,
      [calculatorItemId],
    );

    return rows;
  },

  // GET DOOR VARIANT SIDES
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

  // GET DOOR VARIANT SIDE
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

  // GET DOOR VARIANT OPTIONS
  getDoorVariantOptions: async (doorVariantId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvo.id,
        dvo.door_variant_id,
        dvo.service_id,
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

  // GET DOOR VARIANT OPTION
  getDoorVariantOption: async (doorVariantId, serviceId) => {
    const [rows] = await pool.execute(
      `
      SELECT
        dvo.id,
        dvo.door_variant_id,
        dvo.service_id,
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

  // GET CALCULATOR ITEM BY ID
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

  // GET CALCULATOR ITEMS BY PRODUCT
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

  // CREATE CALCULATOR ITEM
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

  // CREATE DOOR VARIANT
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

  // CREATE DOOR VARIANT SIDE
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

  // CREATE DOOR VARIANT OPTION
  createDoorVariantOption: async (connection, data) => {
    const { door_variant_id, service_id, quantity } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO door_variant_options
      (
        door_variant_id,
        service_id,
        quantity
      )
      VALUES (?, ?, ?)
      `,
      [door_variant_id, service_id, quantity],
    );

    return result.insertId;
  },
};

export default Calculator;
