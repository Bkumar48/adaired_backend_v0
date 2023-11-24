const express = require("express");
const {create, update, get, getAll, deleted, updateStatus } = require("../Controllers/TestimonialController");
const { authMiddleware } = require("../Middleware/authMiddleware");
const TestimonialRouter = express.Router();
//Create testimonial
TestimonialRouter.post("/create", authMiddleware, create);

// Update testimonail
TestimonialRouter.put("/update", authMiddleware, update);  

// Get single testimonial
TestimonialRouter.get("/get", authMiddleware, get);

// Get all testimonial
TestimonialRouter.get("/getAll", authMiddleware, getAll);

// Delete the testimonial
TestimonialRouter.delete("/deleted",authMiddleware, deleted);

TestimonialRouter.put("/updateStatus", authMiddleware, updateStatus)

module.exports = TestimonialRouter;
