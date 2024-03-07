const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const CareerFormController = require("../Controllers/CareerFormController");

// Create CareerForm
router.post("/createCareerForm", CareerFormController.createCareerForm);

// Get CareerForm
router.get("/getCareerForm", CareerFormController.getCareerForm);

// Get CareerForm by ID
router.get("/getCareerFormById/:id", CareerFormController.getCareerFormById);

// Update CareerForm
router.put(
  "/updateCareerForm/:id",
  authMiddleware,
  CareerFormController.updateCareerForm
);

// Delete CareerForm
router.delete(
  "/deleteCareerForm/:id",
  authMiddleware,
  CareerFormController.deleteCareerForm
);

module.exports = router;
