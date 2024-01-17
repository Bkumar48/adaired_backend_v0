const express = require("express");
const router = express.Router();
const ServiceController = require("../Controllers/Service_Controller");
const { authMiddleware } = require("../Middleware/authMiddleware");

// Add the updated getServices route for slug and parent/child slug queries
// router.get("/:id", ServiceController.getServices);
router.get("/", ServiceController.getServices);
router.get("/:slug", ServiceController.getServices);
router.get("/:parentlug/:slug", ServiceController.getServices);


router.put("/:serviceId", authMiddleware, ServiceController.updateService);
router.delete("/:serviceId", authMiddleware, ServiceController.deleteService);
router.post("/", authMiddleware, ServiceController.createNewService);

module.exports = router;
