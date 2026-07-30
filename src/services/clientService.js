import { pool } from '../db/connectDB.js';

// GET ALL CLIENTS
export const getClients = async () => {
  const [rows] = await pool.execute(
    `
  SELECT
    clients.*,
    users.name AS created_by_name
  FROM clients
  LEFT JOIN users
    ON clients.created_by = users.id
  WHERE clients.archived_at IS NULL
  ORDER BY clients.created_at DESC;
    `,
  );

  return rows;
};

// GET CLIENT BY ID
export const getClientById = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT
  clients.*,
  users.name AS created_by_name
  FROM clients
  LEFT JOIN users
  ON clients.created_by = users.id
  WHERE clients.id = ?;
    `,
    [id],
  );

  return rows[0];
};

// CREATE CLIENT
export const createClient = async (data, userId) => {
  const {
    name,
    nip = null,
    phone = null,
    email = null,
    city = null,
    address = null,
    comment = null,
  } = data;

  const [result] = await pool.execute(
    `
    INSERT INTO clients
(
  name,
  nip,
  phone,
  email,
  city,
  address,
  comment,
  created_by
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [name, nip, phone, email, city, address, comment, userId],
  );

  const client = await getClientById(result.insertId);

  return client;
};

// UPDATE CLIENT
export const updateClient = async (id, data, userId) => {
  const { name, nip, phone, email, city, address, comment } = data;

  const [result] = await pool.execute(
    `
    UPDATE clients
    SET
      name = ?,
      nip = ?,
      phone = ?,
      email = ?,
      city = ?,
      address = ?,
      comment = ?,
      updated_by = ?
    WHERE id = ?
    `,
    [name, nip, phone, email, city, address, comment, userId, id],
  );

  return result.affectedRows > 0;
};

export const archiveClient = async (id, userId) => {
  const [result] = await pool.execute(
    `
    UPDATE clients
    SET
      archived_at = NOW(),
      updated_by = ?
    WHERE id = ?
    `,
    [userId, id],
  );

  return result.affectedRows > 0;
};
