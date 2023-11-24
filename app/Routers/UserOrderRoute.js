'use strict';
const express = require('express');
const { getAllOrders, getInvoice, pdfDwonload }= require("../Controllers/UserOrderController")
const { authMiddleware } = require("../Middleware/authMiddleware");
const UserOrderRouter = express.Router();

// get the order 
UserOrderRouter.get('/getAllOrders',authMiddleware, getAllOrders)

// get user Invoice
UserOrderRouter.get("/getInvoice",authMiddleware,getInvoice) 

// get user Invoice in pdf
 UserOrderRouter.get("/pdfDwonload", authMiddleware, pdfDwonload);
 

module.exports = UserOrderRouter;