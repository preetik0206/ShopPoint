const asyncHandler = require("../middleware/async");
const createError = require("../utilis/createError");
const Order = require("../models/Order");
const Razorpay = require('razorpay');
const { options } = require("mongoose");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).send(res.advanceResults);
});
const authOrder = asyncHandler(async (req, res, next) => {
  const authOrders = await Order.find({ userId: req.user._id }).populate({
    path: "userId",
    select: "name email",
  });
  return res.status(200).send({
    status: "success",
    count: authOrders.length,
    data: authOrders,
  });
});

const getOrder = asyncHandler(async (req, res, next) => {
  const findOrder = await Order.findById(req.params.orderId).populate({
    path: "userId",
    select: "name email",
  });

  if (!findOrder)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  res.status(200).send({
    status: "success",
    data: findOrder,
  });
});

const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const currency = 'INR'
    const amount = req.body.totalPrice
    const options = {
      amount: parseInt(amount),
      currency,
      notes : {
        "userId" : `${req.user._id}`
      }
    }
    console.log('req.user._id :>> ', req.user._id);
    const order = await razorpay.orders.create(options)
    // const fetchOrder = await razorpay.orders.fetch(order.id) 
    // console.log('fetchOrder :>> ', fetchOrder);
    // parseInt(req.body)
    const newOrder = await Order.create({
      orderId: order.id,
      ...req.body,
      userId: req.user._id,
    });
  
    res
      .status(201)
      .send({ 
        amount :newOrder.totalPrice,
        order_id : newOrder.orderId
        });
  } catch (error) {
    console.log('error :>> ', error);
  }
});

const payment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );
  order.isPaid = true;
  order.paidAt = Date.now();
  if (req.body.status) {
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
  } else {
    //Esewa payment integration
    order.paymentResult = {
      id: order._id,
      status: 200,
      update_time: Date.now(),
      email_address: "epaytest@gmail.com",
    };
  }

  await order.save();

  const updatedorder = await Order.findById(req.params.orderId);

  res
    .status(201)
    .send({ status: "success", message: "Order Paid.", data: updatedorder });
});

const deliverOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  await order.save();

  const updatedorder = await Order.findById(req.params.orderId);

  res
    .status(201)
    .send({ status: "success", message: "Order Paid.", data: updatedorder });
});

const updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  //check if order belongs to user created or user is admin

  const findOrder = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user._id,
  });

  if (!findOrder && req.user.role !== "admin")
    throw createError(400, "Not authorized to update this review");

  await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true,
    runValidators: true,
  });

  const updatedOrder = await Order.findById(req.params.orderId);

  res.status(200).send({ status: "success", data: updatedOrder });
});

const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order)
    throw createError(
      404,
      `Order is not found with id of ${req.params.orderId}`
    );

  //check if review belongs to user created or user is admin
  const findOrder = await Order.findOne({
    _id: req.params.orderId,
    userId: req.user._id,
  });

  if (!findOrder && req.user.role !== "admin")
    throw createError(400, "Not authorized to update this review");

  await Order.findByIdAndDelete(req.params.orderId);

  res
    .status(204)
    .send({ status: "success", message: "Order Deleted Successfully" });
});
module.exports = {
  getOrders,
  authOrder,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  payment,
  deliverOrder,
};
