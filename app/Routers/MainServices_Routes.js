const express = require("express");
const router = express.Router();
const mainServiceController = require("../Controllers/MainService_Controller");
const { authMiddleware } = require("../Middleware/authMiddleware");

router.post("/", authMiddleware, mainServiceController.createNewMainService);
router.get("/", authMiddleware, mainServiceController.getAllMainServices);
router.get("/:id", authMiddleware, mainServiceController.getSingleMainService);
router.put("/:id", authMiddleware, mainServiceController.updateMainService);
router.delete("/:id", authMiddleware, mainServiceController.deleteMainService);

module.exports = router;
