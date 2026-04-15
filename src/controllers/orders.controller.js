import * as OrdersService from "../services/orders.service.js";
import { successResponse } from "../utils/response.js";
import AppError from "../errors/AppError.js";

export async function create(req, res, next) {
  try {
    const buyerId = req.user.uid;
    const order = await OrdersService.createOrder({ ...req.body, buyerId });
    return successResponse(res, order, {}, 201);
  } catch (error) {
    next(error);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const buyerId = req.user.uid;
    const orders = await OrdersService.getOrdersByBuyer(buyerId);
    return successResponse(res, orders);
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const uid = req.user.uid;

    // Apenas vendedor dos itens ou admin pode atualizar
    const doc = await (await import("../config/firebase.js")).db
      .collection("orders")
      .doc(orderId)
      .get();

    if (!doc.exists)
      throw new AppError("Pedido não encontrado", 404, "NOT_FOUND");

    const order = doc.data();
    const isBuyer = order.buyerId === uid;
    const isAdmin = req.user.isAdmin === true;
    const isSeller =
      order.items?.some((i) => i.sellerId === uid) || false;

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new AppError("Sem permissão para atualizar este pedido", 403, "FORBIDDEN");
    }

    const result = await OrdersService.updateOrderStatus(orderId, status);
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
}
