const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../Middleware/authMiddleware");
const CaseStudiesCategories_Controller = require("../Controllers/CaseStudiesCategories_Controller");

router.post(
  "/createCaseStudiesCategory",
  authMiddleware,
  CaseStudiesCategories_Controller.createCaseStudiesCategory
);
router.put(
  "/updateCaseStudiesCategory/:slug",
  authMiddleware,
  CaseStudiesCategories_Controller.updateCaseStudiesCategory
);
router.get(
  "/getCaseStudiesCategory/:slug",
  CaseStudiesCategories_Controller.getCaseStudiesCategory
);
router.delete(
  "/deleteCaseStudiesCategory/:slug",
  authMiddleware,
  CaseStudiesCategories_Controller.deleteCaseStudiesCategory
);

module.exports = router;
 