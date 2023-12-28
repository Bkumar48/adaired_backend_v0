const express = require("express");
const {
  createBlog,
  updateBlog,
  getBlog,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
} = require("../Controllers/BlogController");
const { authMiddleware } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/createBlog", authMiddleware, createBlog);
router.put("/like", authMiddleware, liketheBlog);
router.put("/dislike", authMiddleware, disliketheBlog);
router.put("/updateBlog/:id", authMiddleware, updateBlog); //authMiddleware, isAdmin,
router.delete("/deleteBlog/:id", authMiddleware, deleteBlog);
router.get("/findBlog", authMiddleware, getBlog);

module.exports = router;

