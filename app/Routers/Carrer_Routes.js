const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const Carrer_Controller = require("../Controllers/Carrer_Controller");

// Create Carrer
router.post("/createJob", authMiddleware, Carrer_Controller.createJob);

// Update Carrer
router.put("/updateJob/:id", authMiddleware, Carrer_Controller.updateJob);

// Get Carrer by id
router.get("/:id", Carrer_Controller.findJob);

// Delete Carrer
router.delete("/deleteJob/:id", authMiddleware, Carrer_Controller.deleteJob);

module.exports = router;
