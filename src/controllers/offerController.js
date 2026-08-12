import {
  createOffer,
  getOffers,
  getOfferById,
  updateOffer,
} from '../services/offerService.js';

import { generateOfferPdf } from '../services/offerPdfService.js';

export const createOfferController = async (req, res) => {
  try {
    const offerId = await createOffer(req.body, req.user);

    const offer = await getOfferById(offerId, req.user);

    res.status(201).json({
      message: 'Offer created successfully',
      offer,
    });
  } catch (error) {
    console.error('createOfferController error:', error);

    if (error.message === 'You do not have access to this client') {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || 'Failed to create offer',
    });
  }
};

export const getOffersController = async (req, res) => {
  try {
    const { client_id } = req.query;

    const offers = await getOffers(req.user, client_id);

    res.status(200).json({
      offers,
    });
  } catch (error) {
    console.error('getOffersController error:', error);

    if (error.message === 'You do not have access to this client') {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || 'Failed to get offers',
    });
  }
};

export const getOfferByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const offer = await getOfferById(id, req.user);

    res.status(200).json({
      offer,
    });
  } catch (error) {
    console.error('getOfferByIdController error:', error);

    if (error.message === 'Offer not found') {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === 'You do not have access to this client') {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || 'Failed to get offer',
    });
  }
};

export const updateOfferController = async (req, res) => {
  try {
    const { id } = req.params;

    await updateOffer(id, req.body, req.user);

    const updatedOffer = await getOfferById(id, req.user);

    res.status(200).json({
      message: 'Offer updated successfully',
      offer: updatedOffer,
    });
  } catch (error) {
    console.error('updateOfferController error:', error);

    if (error.message === 'Offer not found') {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === 'You do not have access to this client') {
      return res.status(403).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: error.message || 'Failed to update offer',
    });
  }
};

//pdf
export const downloadOfferPdfController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const offer = await getOfferById(id, req.user);

    generateOfferPdf(offer, res);
  } catch (error) {
    console.error('downloadOfferPdfController error:', error);

    if (error.message === 'Offer not found') {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === 'You do not have access to this client') {
      return res.status(403).json({
        message: error.message,
      });
    }

    return next(error);
  }
};
