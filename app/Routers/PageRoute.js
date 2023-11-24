
'use strict';
const express = require('express');
const PageRoute = express.Router();
const {pageAdd, pageList, getSinglePage, updateSinglePage, deletePage,testEn} = require('../Controllers/PageController');
const {authMiddleware} = require("../Middleware/authMiddleware")



//******************************************************************************
// CATEGORY SECTION 
//******************************************************************************  

// Category Add routes
PageRoute.post('/pageAdd', authMiddleware, pageAdd)

// Category Get list routes
PageRoute.get('/pageList', authMiddleware, pageList)

// Category single get routes
PageRoute.get('/getSinglePage', authMiddleware, getSinglePage)

// Category update routes
PageRoute.put('/updateSinglePage', authMiddleware, updateSinglePage)

// Category Delete routes
PageRoute.delete('/deleteCate', authMiddleware, deletePage)

PageRoute.post('/testEn',  testEn)
 

module.exports = PageRoute;