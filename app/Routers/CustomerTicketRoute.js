'use strict';
const express = require('express');
const ticketRoute = express.Router();
const {ticketCreate, ticketGet} = require('../Controllers/UserTicketController');
const JWTcustomer = require("../Middleware/customerJWT")
const auth = JWTcustomer.verifyToken;
// Create Ticket
ticketRoute.post('/ticketCreate',auth, ticketCreate)

// Get Customer Ticket 
ticketRoute.get('/ticketGet',auth, ticketGet)

module.exports = ticketRoute;