import * as clientService from '../services/clientService.js';

export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients();

    res.json(clients);
  } catch (error) {
    next(error);
  }
};

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

export const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {

    const { id } = req.params;


    const updated = await clientService.updateClient(
      id,
      req.body
    );


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
