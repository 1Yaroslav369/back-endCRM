import { pool } from '../db/connectDB.js';

class Offer {
  // CREATE OFFER
  static async create(data) {
    const {
      client_id = null,
      client_name = null,
      client_phone = null,
      client_email = null,
      created_by,
      offer_number,
      title,
      description = null,
      status,
      net_price,
      vat,
      valid_until = null,
      comment = null,
    } = data;

    const [result] = await pool.execute(
      `
      INSERT INTO offers
      (
        client_id,
        client_name,
        client_phone,
        client_email,
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        client_id,
        client_name,
        client_phone,
        client_email,
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

  // GET ALL OFFERS
  static async findAll(user, client_id) {
    let query = `
      SELECT
        offers.id,
        offers.client_id,

        COALESCE(clients.name, offers.client_name) AS client_name,
        COALESCE(clients.phone, offers.client_phone) AS client_phone,
        COALESCE(clients.email, offers.client_email) AS client_email,

        offers.created_by,
        offers.offer_number,
        offers.title,
        offers.description,
        offers.status,
        offers.net_price,
        offers.vat,
        offers.valid_until,
        offers.comment,
        offers.is_archived,
        offers.created_at,
        offers.updated_at,

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

  // GET OFFER BY ID
  static async findById(id, user) {
    const [rows] = await pool.execute(
      `
      SELECT
        offers.id,
        offers.client_id,

        COALESCE(clients.name, offers.client_name) AS client_name,
        COALESCE(clients.phone, offers.client_phone) AS client_phone,
        COALESCE(clients.email, offers.client_email) AS client_email,

        offers.created_by,
        offers.offer_number,
        offers.title,
        offers.description,
        offers.status,
        offers.net_price,
        offers.vat,
        offers.valid_until,
        offers.comment,
        offers.is_archived,
        offers.created_at,
        offers.updated_at,

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

  // UPDATE OFFER
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

  // UPDATE OFFER STATUS
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE offers
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND is_archived = 0
      `,
      [status, id],
    );

    return result.affectedRows > 0;
  }

  // UPDATE OFFER STATUS WITH CONNECTION
  static async updateStatusWithConnection(connection, id, status) {
    const [result] = await connection.execute(
      `
      UPDATE offers
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
        AND is_archived = 0
      `,
      [status, id],
    );

    return result.affectedRows > 0;
  }

  // GET LAST OFFER NUMBER
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
