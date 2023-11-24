'use strict';
const express = require('express');
const FrontRoute = express.Router();
const {allProduct, productMenu,faqPage,faqMenu,blogs} = require('../Controllers/FrontController');


//******************************************************************************
// PRODUCT PAGE  
//******************************************************************************  

// Product get all
FrontRoute.get("/allProduct", allProduct);

// Get product menu
FrontRoute.get('/productMenu', productMenu)


//******************************************************************************
// FAQ PAGE  
//******************************************************************************  

// Faq get all
FrontRoute.get("/faqPage", faqPage);

// FAQ Menu
FrontRoute.get("/faqMenu",faqMenu);

//******************************************************************************
// BLOG PAGE  
//******************************************************************************  
FrontRoute.get("/blogs",blogs)


module.exports = FrontRoute;