const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const CaseStudy_Controller = require("../Controllers/CaseStudies_Controller");

// Create Case Study
router.post(
  "/createCaseStudy",
  authMiddleware,
  CaseStudy_Controller.createCaseStudy
);

// Update Case Study
router.put(
  "/updateCaseStudy/:slug",
  authMiddleware,
  CaseStudy_Controller.updateCaseStudy
);

// Get Case Study by Slug
router.get("/:slug", CaseStudy_Controller.getCaseStudy);

// Delete Case Study
router.delete(
  "/deleteCaseStudy/:slug",
  authMiddleware,
  CaseStudy_Controller.deleteCaseStudy
);

module.exports = router;
