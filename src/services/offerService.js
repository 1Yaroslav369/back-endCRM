import Offer from '../models/offer.js';
import { checkClientAccess } from './clientService.js';

// CREATE OFFER

export const createOffer = async (data, user) => {
  const hasAccess = await checkClientAccess(data.client_id, user);

  if (!hasAccess) {
    throw new Error('You do not have access to this client');
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

  const hasAccess = await checkClientAccess(offer.client_id, user);

  if (!hasAccess) {
    throw new Error('You do not have access to this client');
  }

  return offer;
};

// UPDATE OFFER

export const updateOffer = async (id, data, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  const hasAccess = await checkClientAccess(offer.client_id, user);

  if (!hasAccess) {
    throw new Error('You do not have access to this client');
  }

  return await Offer.update(id, data);
};

// UPDATE OFFER STATUS

export const updateOfferStatus = async (id, status, user) => {
  const offer = await Offer.findById(id, user);

  if (!offer) {
    throw new Error('Offer not found');
  }

  const hasAccess = await checkClientAccess(offer.client_id, user);

  if (!hasAccess) {
    throw new Error('You do not have access to this client');
  }

  const currentStatus = offer.status;

  // Allowed status transitions
  const allowedTransitions = {
    DRAFT: ['SENT'],
    SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
    ACCEPTED: ['CONVERTED'],
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

  // Update status
  const updated = await Offer.updateStatus(id, status);

  if (!updated) {
    throw new Error('Failed to update offer status');
  }

  return await Offer.findById(id, user);
};
