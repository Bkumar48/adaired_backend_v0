'use strict';
const express = require('express');
const { getAllOrders, getInvoice, dwonloadReport, singleOrder,deleteOrder, getDeletedOrders }= require("../Controllers/AdminOrderController")
const { authMiddleware } = require("../Middleware/authMiddleware");
const AdminOrderRouter = express.Router();

// get the order 
AdminOrderRouter.get('/getAllOrders',authMiddleware, getAllOrders)

// get user Invoice
AdminOrderRouter.get("/getInvoice",authMiddleware,getInvoice) 

// Generate the report  
AdminOrderRouter.get("/dwonloadReport",  authMiddleware, dwonloadReport);

// Get single order
AdminOrderRouter.get("/singleOrder", authMiddleware,singleOrder) 

// Delete Order
AdminOrderRouter.delete("/deleteOrder", authMiddleware, deleteOrder)

// Get Deleted Order
AdminOrderRouter.get("/getDeletedOrders", authMiddleware, getDeletedOrders)
module.exports = AdminOrderRouter;