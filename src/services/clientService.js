import { pool } from '../db/connectDB.js';

// GET ALL CLIENTS
export const getClients = async () => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM clients
    ORDER BY created_at DESC
    `,
  );

  return rows;
};

// GET CLIENT BY ID
export const getClientById = async (id) => {
  const [rows] = await pool.execute(
    `
    SELECT *
    FROM clients
    WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// CREATE CLIENT
export const createClient = async (data) => {
  const {
    name,
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
      phone,
      email,
      city,
      address,
      comment
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, phone, email, city, address, comment],
  );

  const client = await getClientById(result.insertId);

  return client;
};

// UPDATE CLIENT
export const updateClient = async (id, data) => {
  const allowedFields = [
    'name',
    'phone',
    'email',
    'city',
    'address',
    'comment',
  ];

  const fields = [];
  const values = [];

  Object.entries(data).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return 0;
  }

  values.push(id);

  const [result] = await pool.execute(
    `
    UPDATE clients
    SET ${fields.join(', ')}
    WHERE id = ?
    `,
    values,
  );

  return result.affectedRows;
};

// DELETE CLIENT
export const deleteClient = async (id) => {
  const [result] = await pool.execute(
    `
    DELETE FROM clients
    WHERE id = ?
    `,
    [id],
  );

  return result.affectedRows;
};
