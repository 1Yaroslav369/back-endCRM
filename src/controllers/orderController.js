import * as orderService from '../services/orderService.js';

export const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.user);

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(Number(id), req.user);

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const orderId = await orderService.createOrder(req.body, req.user);

    res.status(201).json({
      id: orderId,
      message: 'Order created',
    });
  } catch (error) {
    next(error);
  }
};
