import { pool } from '../db/connectDB.js';

class Order {
  static async create(data) {
    const {
      client_id,
      created_by,
      order_number,
      title,
      status,
      total_price,
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
        total_price,
        deadline,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_id,
        created_by,
        order_number,
        title,
        status,
        total_price,
        deadline,
        comment,
      ],
    );

    return result.insertId;
  }

  static async findAll(user) {
    let query = `
      SELECT
        orders.*,
        clients.name AS client_name,
        users.name AS created_by_name

      FROM orders

      LEFT JOIN clients
        ON orders.client_id = clients.id

      LEFT JOIN users
        ON orders.created_by = users.id

      WHERE orders.is_archived = 0
    `;

    const params = [];

    if (user.role !== 'ADMIN') {
      query += `
        AND orders.created_by = ?
      `;

      params.push(user.id);
    }

    query += `
      ORDER BY orders.created_at DESC
    `;

    const [rows] = await pool.execute(query, params);

    return rows;
  }

  static async findById(id, user) {
    let query = `
    SELECT
      orders.*,
      clients.name AS client_name,
      users.name AS created_by_name

    FROM orders

    LEFT JOIN clients
      ON orders.client_id = clients.id

    LEFT JOIN users
      ON orders.created_by = users.id

    WHERE orders.id = ?
  `;

    const params = [id];

    if (user.role !== 'ADMIN') {
      query += `
      AND orders.created_by = ?
    `;

      params.push(user.id);
    }

    const [rows] = await pool.execute(query, params);

    return rows[0] || null;
  }
}

export default Order;
