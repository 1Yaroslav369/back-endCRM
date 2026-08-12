import Offer from '../models/offer.js';
import { checkClientAccess } from './clientService.js';

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
    status: data.status || 'DRAFT',
  };

  return await Offer.create(offerData);
};

export const getOffers = async (user, client_id) => {
  if (client_id) {
    const hasAccess = await checkClientAccess(client_id, user);

    if (!hasAccess) {
      throw new Error('You do not have access to this client');
    }
  }

  return await Offer.findAll(user, client_id);
};

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
