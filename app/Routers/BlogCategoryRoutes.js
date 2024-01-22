const express = require("express");
const router = express.Router();
const {
  createNewCategory,
  findCategory,
  deleteCategoryById,
  updateCategoryById,
} = require("../Controllers/BlogCategoryController");
const { authMiddleware } = require("../Middleware/authMiddleware");

router.put("/updateCategory/:categoryId", authMiddleware, updateCategoryById);
router.delete(
  "/deleteCategory/:categoryId",
  authMiddleware,
  deleteCategoryById
);
router.post("/addCategory", authMiddleware, createNewCategory);
router.get("/findCategory", findCategory);

module.exports = router;
