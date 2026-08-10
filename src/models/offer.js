import { pool } from '../db/connectDB.js';

class Offer {
  static async create(data) {
    const {
      client_id,
      created_by,
      offer_number,
      title,
      description,
      status,
      net_price,
      vat,
      valid_until,
      comment,
    } = data;

    const [result] = await pool.execute(
      `
      INSERT INTO offers
      (
        client_id,
        created_by,
        offer_number,
        title,
        description,
        status,
        net_price,
        vat,
        valid_until,
        comment
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_id,
        created_by,
        offer_number,
        title,
        description,
        status,
        net_price,
        vat,
        valid_until,
        comment,
      ],
    );

    return result.insertId;
  }

  static async findAll(user, client_id) {
    let query = `
      SELECT
        offers.*,
        clients.name AS client_name,
        users.name AS created_by_name,

        ROUND(
          offers.net_price * offers.vat / 100,
          2
        ) AS vat_amount,

        ROUND(
          offers.net_price +
          (offers.net_price * offers.vat / 100),
          2
        ) AS total_price

      FROM offers

      LEFT JOIN clients
        ON offers.client_id = clients.id

      LEFT JOIN users
        ON offers.created_by = users.id

      WHERE offers.is_archived = 0
    `;

    const params = [];

    if (client_id) {
      query += `
        AND offers.client_id = ?
      `;

      params.push(client_id);
    }

    query += `
      ORDER BY offers.created_at DESC
    `;

    const [rows] = await pool.execute(query, params);

    return rows;
  }

  static async findById(id, user) {
    const [rows] = await pool.execute(
      `
      SELECT
        offers.*,
        clients.name AS client_name,
        users.name AS created_by_name,

        ROUND(
          offers.net_price * offers.vat / 100,
          2
        ) AS vat_amount,

        ROUND(
          offers.net_price +
          (offers.net_price * offers.vat / 100),
          2
        ) AS total_price

      FROM offers

      LEFT JOIN clients
        ON offers.client_id = clients.id

      LEFT JOIN users
        ON offers.created_by = users.id

      WHERE offers.id = ?
        AND offers.is_archived = 0
      `,
      [id],
    );

    return rows[0] || null;
  }

  static async update(id, data) {
    const { title, description, status, net_price, vat, valid_until, comment } =
      data;

    const [result] = await pool.execute(
      `
      UPDATE offers
      SET
        title = ?,
        description = ?,
        status = ?,
        net_price = ?,
        vat = ?,
        valid_until = ?,
        comment = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND is_archived = 0
      `,
      [title, description, status, net_price, vat, valid_until, comment, id],
    );

    return result.affectedRows > 0;
  }

  static async getLastOfferNumber() {
    const [rows] = await pool.execute(
      `
      SELECT offer_number
      FROM offers
      ORDER BY created_at DESC
      LIMIT 1
      `,
    );

    return rows[0]?.offer_number || null;
  }
}

export default Offer;
