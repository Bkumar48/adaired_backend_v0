'use strict';
const express = require('express');
const ProductRoute = express.Router();
const {create, getAll, getProductListed,  getSinglePriceRules, updatePriceRules, statusPriceRules, deletePriceRule} = require('../Controllers/PriceRuleController');
const {authMiddleware} = require("../Middleware/authMiddleware")



//******************************************************************************
// PRICE AND RULEs SECTION 
//******************************************************************************  

// Create Price and Rules routes
ProductRoute.post('/create', authMiddleware, create)

// Get all price and rules routes
ProductRoute.get('/getAll', authMiddleware, getAll)

// Get list of product Listed not listed in price and rules
ProductRoute.get("/getProductListed", authMiddleware, getProductListed)

// Get single price and rules
ProductRoute.get('/getSinglePriceRules', authMiddleware, getSinglePriceRules)

// Update price and rules routes
ProductRoute.put('/updatePriceRules', authMiddleware, updatePriceRules)

// Update price and rules routes
ProductRoute.put('/statusPriceRules', authMiddleware, statusPriceRules)

// Delete price and rules routes
ProductRoute.delete('/deletePriceRule', authMiddleware, deletePriceRule)

 

module.exports = ProductRoute;