import Offer from '../models/offer.js';
import Order from '../models/order.js';
import { pool } from '../db/connectDB.js';
import {
  checkClientAccess,
  createClientWithConnection,
} from './clientService.js';

// CREATE OFFER
export const createOffer = async (data, user) => {
  if (data.client_id) {
    const hasAccess = await checkClientAccess(data.client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  const lastOfferNumber = await Offer.getLastOfferNumber();

  let nextNumber = 1;

  if (lastOfferNumber) {
    const match = lastOfferNumber.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  const offer_number = `OF-${String(nextNumber).padStart(5, '0')}`;

  const offerData = {
    ...data,
    created_by: user.id,
    offer_number,
    status: 'DRAFT',
  };

  return await Offer.create(offerData);
};

// GET ALL OFFERS
export const getOffers = async (user, client_id) => {
  if (client_id) {
    const hasAccess = await checkClientAccess(client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  return await Offer.findAll(user, client_id);
};

// GET OFFER BY ID
export const getOfferById = async (id, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  // Check client access only if the offer has a client
  if (offer.client_id) {
    const hasAccess = await checkClientAccess(offer.client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  return offer;
};

// UPDATE OFFER
export const updateOffer = async (id, data, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  // Check client access only if the offer has a client
  if (offer.client_id) {
    const hasAccess = await checkClientAccess(offer.client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  return await Offer.update(id, data);
};

// UPDATE OFFER STATUS
export const updateOfferStatus = async (id, status, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  // Check client access only if the offer has a client
  if (offer.client_id) {
    const hasAccess = await checkClientAccess(offer.client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  const currentStatus = offer.status;

  // CONVERTED can only be set by convertOfferToOrder()
  const allowedTransitions = {
    DRAFT: ['SENT'],
    SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    ACCEPTED: [],
    REJECTED: [],
    EXPIRED: [],
    CONVERTED: [],
  };

  const allowedStatuses = allowedTransitions[currentStatus] || [];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Cannot change offer status from ${currentStatus} to ${status}`,
    );
  }

  const updated = await Offer.updateStatus(id, status);

  if (!updated) {
    throw new Error('Failed to update offer status');
  }

  return await Offer.findById(id, user);
};

// CONVERT OFFER TO ORDER
export const convertOfferToOrder = async (id, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.status !== 'ACCEPTED') {
    throw new Error(
      `Only ACCEPTED offers can be converted. Current status: ${offer.status}`,
    );
  }

  // Check access only if the offer already has a client
  if (offer.client_id) {
    const hasAccess = await checkClientAccess(offer.client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    let clientId = offer.client_id;

    if (!clientId) {
      if (!offer.client_name) {
        throw new Error(
          'Cannot convert offer without client. Client name is required.',
        );
      }

      const client = await createClientWithConnection(
        connection,
        {
          name: offer.client_name,
          phone: offer.client_phone || null,
          email: offer.client_email || null,
        },
        user.id,
      );

      clientId = client.id;

      // Attach newly created client to the offer
      const [offerUpdate] = await connection.execute(
        `
        UPDATE offers
        SET
          client_id = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND is_archived = 0
        `,
        [clientId, id],
      );

      if (offerUpdate.affectedRows === 0) {
        throw new Error('Failed to attach client to offer');
      }
    }

    // Get next order number
    const [rows] = await connection.execute(
      `
      SELECT order_number
      FROM orders
      ORDER BY created_at DESC
      LIMIT 1
      `,
    );

    let nextNumber = 1;

    const lastOrderNumber = rows[0]?.order_number;

    if (lastOrderNumber) {
      const match = lastOrderNumber.match(/^ORD-\d{4}-(\d+)$/);

      if (match) {
        nextNumber = Number(match[1]) + 1;
      }
    }

    const year = new Date().getFullYear();
    const orderNumber = `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;

    // Create order
    const orderId = await Order.createWithConnection(connection, {
      client_id: clientId,
      created_by: user.id,
      order_number: orderNumber,
      title: offer.title,
      status: 'NEW',
      net_price: Number(offer.net_price),
      vat: Number(offer.vat),
      deadline: null,
      comment: offer.comment || null,
    });

    // CONVERTED can only happen here
    const updated = await Offer.updateStatusWithConnection(
      connection,
      id,
      'CONVERTED',
    );

    if (!updated) {
      throw new Error('Failed to convert offer');
    }

    await connection.commit();

    const order = await Order.findById(orderId, user);
    const convertedOffer = await Offer.findById(id, user);

    return {
      offer: convertedOffer,
      order,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
