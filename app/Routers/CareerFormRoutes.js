const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const CareerFormController = require("../Controllers/CareerFormController");

// Create CareerForm
router.post("/createCareerForm", CareerFormController.createCareerForm);

module.exports = router;
