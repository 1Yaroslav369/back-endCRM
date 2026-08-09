import Order from '../models/order.js';
import { checkClientAccess } from './clientService.js';

const ALLOWED_STATUSES = ['NEW', 'IN_PRODUCTION', 'INSTALLATION', 'COMPLETED'];

const ALLOWED_VAT = [0, 5, 8, 23];

const validateOrderData = (data) => {
  if (!data.title || !data.title.trim()) {
    throw new Error('Order title is required');
  }

  const netPrice = Number(data.net_price);

  if (!Number.isFinite(netPrice) || netPrice <= 0) {
    throw new Error('Net price must be greater than 0');
  }

  const vat = Number(data.vat);

  if (!ALLOWED_VAT.includes(vat)) {
    throw new Error('Invalid VAT rate');
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
    throw new Error('Invalid order status');
  }

  return {
    title: data.title.trim(),
    net_price: netPrice,
    vat,
    status: data.status || 'NEW',
    deadline: data.deadline ?? null,
    comment: data.comment?.trim() || null,
  };
};

export const createOrder = async (data, user) => {
  if (!data.client_id) {
    throw new Error('Client is required');
  }

  const hasAccess = await checkClientAccess(data.client_id, user);

  if (!hasAccess) {
    throw new Error('You cannot create order for this client');
  }

  const validatedData = validateOrderData({
    ...data,
    status: 'NEW',
  });

  const lastOrder = await Order.getLastOrderNumber();

  let nextNumber = 1;

  if (lastOrder) {
    const parts = lastOrder.split('-');

    if (parts.length === 3) {
      const lastNumber = Number(parts[2]);

      if (Number.isInteger(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
  }

  const year = new Date().getFullYear();

  const orderNumber = `ORD-${year}-${String(nextNumber).padStart(6, '0')}`;

  const orderId = await Order.create({
    client_id: data.client_id,
    created_by: user.id,
    order_number: orderNumber,
    title: validatedData.title,
    status: 'NEW',
    net_price: validatedData.net_price,
    vat: validatedData.vat,
    deadline: validatedData.deadline,
    comment: validatedData.comment,
  });

  return orderId;
};

export const getOrders = async (user, client_id) => {
  return await Order.findAll(user, client_id);
};

export const getOrderById = async (id, user) => {
  const order = await Order.findById(id, user);

  if (!order) {
    return null;
  }

  return order;
};

export const updateOrder = async (id, data, user) => {
  const order = await Order.findById(id, user);

  if (!order) {
    return null;
  }

  const hasAccess = await checkClientAccess(order.client_id, user);

  if (!hasAccess) {
    throw new Error('You cannot update this order');
  }

  const validatedData = validateOrderData(data);

  const updated = await Order.update(id, {
    title: validatedData.title,
    status: validatedData.status,
    net_price: validatedData.net_price,
    vat: validatedData.vat,
    deadline: validatedData.deadline,
    comment: validatedData.comment,
  });

  if (!updated) {
    return null;
  }

  return await Order.findById(id, user);
};
