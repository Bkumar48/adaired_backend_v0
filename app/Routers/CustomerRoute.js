'use strict';
const express = require('express');
const CustomerRoute = express.Router();
const {register, confirm, login, getCustomerInfo,updateCustomerInfo,updateCustomerPass} = require('../Controllers/CustomerController')
const JWTcustomer = require("../Middleware/customerJWT")
const auth = JWTcustomer.verifyToken;

// Customer Registred
CustomerRoute.post('/register',register)

// Veryfied Customer with mail
CustomerRoute.get("/confirm", confirm)

// Customer Login
CustomerRoute.post('/login',login)

// Customer info
CustomerRoute.get('/getCustomerInfo',auth, getCustomerInfo)

// Customer update info
CustomerRoute.put('/updateCustomerInfo', auth, updateCustomerInfo)

// Customer update password
CustomerRoute.put('/updateCustomerPass', auth, updateCustomerPass)


module.exports = CustomerRoute;