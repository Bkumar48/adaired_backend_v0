'use strict';
const express = require('express');
const ProductRoute = express.Router();
const {productCateAdd, productCateList, getSingleCate, updateSingleCate, deleteCate, productAdd, getSingleProduct, updateProduct, allProduct, deletePro, productStatus} = require('../Controllers/ProductController');
const {authMiddleware} = require("../Middleware/authMiddleware")



//******************************************************************************
// CATEGORY SECTION 
//******************************************************************************  

// Category Add routes
ProductRoute.post('/productCateAdd', authMiddleware, productCateAdd)

// Category Get list routes
ProductRoute.get('/productCateList', authMiddleware, productCateList)

// Category single get routes
ProductRoute.get('/getSingleCate', authMiddleware, getSingleCate)

// Category update routes
ProductRoute.put('/updateSingleCate', authMiddleware, updateSingleCate)

// Category Delete routes
ProductRoute.delete('/deleteCate', authMiddleware, deleteCate)

//******************************************************************************
// PRODUCT SECTION 
//******************************************************************************  
// Product Add
ProductRoute.post('/productAdd', authMiddleware, productAdd)

// Product Single 
ProductRoute.get('/getSingleProduct', authMiddleware, getSingleProduct)

// Product update
ProductRoute.put("/updateProduct", authMiddleware,updateProduct)

// Product get all
ProductRoute.get("/allProduct", authMiddleware, allProduct);

// Product Delete
ProductRoute.delete("/deletePro", authMiddleware, deletePro);

// Product Change status
ProductRoute.put("/productStatus", authMiddleware, productStatus)

module.exports = ProductRoute;