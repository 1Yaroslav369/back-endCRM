import { pool } from '../db/connectDB.js';

class Order {
  // CREATE ORDER
  static async create(data) {
    const {
      client_id,
      created_by,
      order_number,
      title,
      status,
      net_price,
      vat,
      deadline,
      comment,
    } = data;

    const [result] = await pool.execute(
      `
      INSERT INTO orders
      (
        client_id,
        created_by,
        order_number,
        title,
        status,
        net_price,
        vat,
        deadline,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_id,
        created_by,
        order_number,
        title,
        status,
        net_price,
        vat,
        deadline,
        comment,
      ],
    );

    return result.insertId;
  }

  // CREATE ORDER INSIDE TRANSACTION
  static async createWithConnection(connection, data) {
    const {
      client_id,
      created_by,
      order_number,
      title,
      status,
      net_price,
      vat,
      deadline,
      comment,
    } = data;

    const [result] = await connection.execute(
      `
      INSERT INTO orders
      (
        client_id,
        created_by,
        order_number,
        title,
        status,
        net_price,
        vat,
        deadline,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_id,
        created_by,
        order_number,
        title,
        status,
        net_price,
        vat,
        deadline,
        comment,
      ],
    );

    return result.insertId;
  }

  // GET ALL ORDERS
  static async findAll(user, client_id) {
    let query = `
      SELECT
        orders.*,
        clients.name AS client_name,
        users.name AS created_by_name,

        ROUND(
          orders.net_price * orders.vat / 100,
          2
        ) AS vat_amount,

        ROUND(
          orders.net_price +
          (orders.net_price * orders.vat / 100),
          2
        ) AS total_price

      FROM orders

      LEFT JOIN clients
        ON orders.client_id = clients.id

      LEFT JOIN users
        ON orders.created_by = users.id

      WHERE orders.is_archived = 0
    `;

    const params = [];

    if (client_id) {
      query += `
        AND orders.client_id = ?
      `;

      params.push(client_id);
    }

    query += `
      ORDER BY orders.created_at DESC
    `;

    const [rows] = await pool.execute(query, params);

    return rows;
  }

  // GET ORDER BY ID
  static async findById(id, user) {
    const [rows] = await pool.execute(
      `
      SELECT
        orders.*,
        clients.name AS client_name,
        users.name AS created_by_name,

        ROUND(
          orders.net_price * orders.vat / 100,
          2
        ) AS vat_amount,

        ROUND(
          orders.net_price +
          (orders.net_price * orders.vat / 100),
          2
        ) AS total_price

      FROM orders

      LEFT JOIN clients
        ON orders.client_id = clients.id

      LEFT JOIN users
        ON orders.created_by = users.id

      WHERE orders.id = ?
        AND orders.is_archived = 0
      `,
      [id],
    );

    return rows[0] || null;
  }

  // UPDATE ORDER
  static async update(id, data) {
    const { title, status, net_price, vat, deadline, comment } = data;

    const [result] = await pool.execute(
      `
      UPDATE orders
      SET
        title = ?,
        status = ?,
        net_price = ?,
        vat = ?,
        deadline = ?,
        comment = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND is_archived = 0
      `,
      [title, status, net_price, vat, deadline, comment, id],
    );

    return result.affectedRows > 0;
  }

  // GET LAST ORDER NUMBER
  static async getLastOrderNumber() {
    const [rows] = await pool.execute(
      `
      SELECT order_number
      FROM orders
      ORDER BY created_at DESC
      LIMIT 1
      `,
    );

    return rows[0]?.order_number || null;
  }
}

export default Order;
