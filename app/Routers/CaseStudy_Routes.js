const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const CaseStudy_Controller = require("../Controllers/CaseStudy_Controller");

router.post(
  "/createCaseStudy",
  authMiddleware,
  CaseStudy_Controller.createCaseStudy
);

module.exports = router;