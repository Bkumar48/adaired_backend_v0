'use strict';
const express = require('express');
const {orderSummery, applyCoupon, createOrder,getOrder, varifyBitcoinpay,verifyRazopay,paymentBitcoin, emailTest}= require("../Controllers/OrderController")
const { authMiddleware } = require("../Middleware/authMiddleware");
const OrderRouter = express.Router();


// Get order summery
OrderRouter.get("/orderSummery", authMiddleware, orderSummery)

// Apply coupon 
OrderRouter.put("/applyCoupon", authMiddleware, applyCoupon)

// Create the cart and paid
OrderRouter.post("/createOrder",authMiddleware,createOrder);

// get the order 
OrderRouter.get('/getOrder', getOrder)

// verify the bitcoin has paid or not
OrderRouter.put('/varifyBitcoinpay',authMiddleware, varifyBitcoinpay)

// verify the payment from razorpay
OrderRouter.put('/verifyRazopay', verifyRazopay)

// repayment by bitcoins
OrderRouter.put("/paymentBitcoin", authMiddleware, paymentBitcoin) 


OrderRouter.get('/emailTest',emailTest)

// get a cart 
//CartRouter.get('/lebon',authMiddleware, lebon)

module.exports = OrderRouter;