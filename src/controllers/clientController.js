import * as clientService from '../services/clientService.js';

// GET /clients
export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients();

    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// GET /clients/:id
export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await clientService.getClientById(id);

    if (!client) {
      return res.status(404).json({
        message: 'Client not found',
      });
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

// POST /clients
export const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body, req.user.id);

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

// PATCH /clients/:id
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await clientService.updateClient(id, req.body, req.user.id);

    if (!updated) {
      return res.status(404).json({
        message: 'Client not found',
      });
    }

    const client = await clientService.getClientById(id);

    res.json(client);
  } catch (error) {
    next(error);
  }
};

// DELETE to archive /clients/:id/archive
export const archiveClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const archived = await clientService.archiveClient(id, req.user.id);

    if (!archived) {
      return res.status(404).json({
        message: 'Client not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

//get clients/search

export const searchClients = async (req, res, next) => {
  try {
    const { query } = req.query;
    const clients = await clientService.searchClients(query);
    res.json(clients);
  } catch (error) {
    next(error);
  }
};
