'use strict';
const express = require('express');
const ProductRoute = express.Router();
const {faqCateAdd, faqCateList, getSinglefaqCate, updateSinglefaqCate, deleteFaqCate, faqAdd, getSinglefaq, updateFaq, allFaq, deleteFaq, productStatus} = require('../Controllers/FaqsController');
const {authMiddleware} = require("../Middleware/authMiddleware")


//******************************************************************************
// CATEGORY SECTION 
//******************************************************************************  

// Category Add routes
ProductRoute.post('/faqCateAdd', authMiddleware, faqCateAdd)

// Category Get list routes
ProductRoute.get('/faqCateList', authMiddleware, faqCateList)

// Category single get routes
ProductRoute.get('/getSinglefaqCate', authMiddleware, getSinglefaqCate)

// Category update routes
ProductRoute.put('/updateSinglefaqCate', authMiddleware, updateSinglefaqCate)

// Category Delete routes
ProductRoute.delete('/deleteFaqCate', authMiddleware, deleteFaqCate)

//******************************************************************************
// PRODUCT SECTION 
//******************************************************************************  
// Product Add
ProductRoute.post('/faqAdd', authMiddleware, faqAdd)

// Product Single 
ProductRoute.get('/getSinglefaq', authMiddleware, getSinglefaq)

// Product update
ProductRoute.put("/updateFaq", authMiddleware,updateFaq)

// Product get all
ProductRoute.get("/allFaq", authMiddleware, allFaq);

// Product Delete
ProductRoute.delete("/deleteFaq", authMiddleware, deleteFaq);

// Product Change status
ProductRoute.put("/productStatus", authMiddleware, productStatus)

module.exports = ProductRoute;