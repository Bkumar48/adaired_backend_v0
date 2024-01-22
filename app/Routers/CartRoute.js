'use strict';
const express = require('express');
const {addCart,updateQty,remProductCart,getCart,emptyCart,lebon}= require("../Controllers/CartController")
const { authMiddleware } = require("../Middleware/authMiddleware");
const CartRouter = express.Router();

// Add to cart
CartRouter.post("/addCart",authMiddleware,addCart);

// Update product quantity
CartRouter.put('/updateQty',authMiddleware, updateQty)

// Remove the product from the cart 
CartRouter.delete('/remProductCart',authMiddleware, remProductCart)

// get a cart 
CartRouter.get('/getCart',authMiddleware, getCart)

// Cart empty the cart 
CartRouter.delete('/emptyCart',authMiddleware, emptyCart)

// get a cart 
//CartRouter.get('/lebon',authMiddleware, lebon)

module.exports = CartRouter;