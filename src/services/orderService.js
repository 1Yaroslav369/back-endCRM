import Order from '../models/order.js';
import { checkClientAccess } from './clientService.js';

export const createOrder = async (data, user) => {
  const hasAccess = await checkClientAccess(data.client_id, user);

  if (!hasAccess) {
    throw new Error('You cannot create order for this client');
  }

  const lastOrder = await Order.getLastOrderNumber();
  let nextNumber = 1;

  if (lastOrder) {
    nextNumber = Number(lastOrder.split('-')[2]) + 1;
  }

  const year = new Date().getFullYear();
  const orderNumber = `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;

  const orderId = await Order.create({
    client_id: data.client_id,
    created_by: user.id,
    order_number: orderNumber,
    title: data.title,
    status: 'NEW',
    total_price: data.total_price,
    deadline: data.deadline ?? null,
    comment: data.comment ?? null,
  });

  return orderId;
};

export const getOrders = async (user) => {
  return await Order.findAll(user);
};

export const getOrderById = async (id, user) => {
  const order = await Order.findById(id, user);

  if (!order) {
    return null;
  }


  return order;
};
