const express = require("express");
const router = express.Router();
const ServiceController = require("../Controllers/Service_Controller");
const { authMiddleware } = require("../Middleware/authMiddleware");

router.put("/:serviceId", authMiddleware, ServiceController.updateService);
router.delete("/:serviceId", authMiddleware, ServiceController.deleteService);
router.post("/", authMiddleware, ServiceController.createNewService);
router.get("/", authMiddleware, ServiceController.getServices);

module.exports = router;
