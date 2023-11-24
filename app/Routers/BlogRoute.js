const express = require("express");
const {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    liketheBlog,
    disliketheBlog
    
} = require("../Controllers/BlogController");
const { authMiddleware } = require("../Middleware/authMiddleware");
const router = express.Router();

router.post("/create-blog", authMiddleware, createBlog);
router.put('/like', authMiddleware, liketheBlog);
router.put('/dislike', authMiddleware, disliketheBlog);
router.put("/updateBlog", authMiddleware, updateBlog); //authMiddleware, isAdmin,
router.get("/all-blogs", authMiddleware, getAllBlogs);
router.delete("/deleteBlog",authMiddleware, deleteBlog);
router.get("/singleBlog", authMiddleware, getBlog);

module.exports = router;
