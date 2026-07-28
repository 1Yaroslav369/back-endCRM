import * as clientService from '../services/clientService.js';
//get
export const getClients = async (req, res, next) => {
  try {
    const clients = await clientService.getClients();

    res.json(clients);
  } catch (error) {
    next(error);
  }
};
//get:id
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
//post
export const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};
//pathc
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updated = await clientService.updateClient(id, req.body);

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

//delete
export const deleteClient = async (req, res, next) => {
  const { id } = req.params;

  const deleted = await clientService.deleteClient(id);

  if(!deleted) {
    return res.status(404).json({
      message: 'Client not found',
    });
  }

  res.status(204).send();
};
