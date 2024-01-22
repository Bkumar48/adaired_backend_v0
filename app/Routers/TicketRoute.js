"use strict";
const express = require("express");
const ticketRoute = express.Router();
const {
  ticketCreate,
  ticketGet,
  userTicketGetById,
  AdminticketCreate,
  ticketsGetAll,
  ticketGetById,
  threadReply,
  ticketStatusChnage
} = require("../Controllers/TicketsController");
const { authMiddleware } = require("../Middleware/authMiddleware");

// Create Ticket
ticketRoute.post("/customer/ticketCreate", authMiddleware, ticketCreate);

// Get All Tickets Created by Logged in Customer
ticketRoute.get("/customer/ticketGet", authMiddleware, ticketGet);

// Get User Ticket By Id
ticketRoute.get("/customer/ticketGetById", authMiddleware, userTicketGetById);


// ********************************************************************************************
// ************************************* ADMIN ROUTES  ****************************************
// ********************************************************************************************

// Raise a ticket to user
ticketRoute.post("/admin/ticketCreate", authMiddleware, AdminticketCreate);

// Get all Tickets for admin
ticketRoute.get("/admin/ticketGetAll", authMiddleware, ticketsGetAll);

// Get Ticket By Id
ticketRoute.get("/admin/ticketGetById", authMiddleware, ticketGetById);

// Change the status of ticket
ticketRoute.put("/admin/ticketStatusChnage", authMiddleware, ticketStatusChnage);

// ********************************************************************************************
// ****************************** THREAD ROUTES  **********************************************
// ********************************************************************************************

// Create a thread
ticketRoute.put("/thread", authMiddleware, threadReply);

module.exports = ticketRoute;
