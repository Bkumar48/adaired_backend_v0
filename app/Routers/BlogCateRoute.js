const express = require('express');
const router = express.Router();
const {addCategory,subCategory, getCategories, getSubCategories} = require('../Controllers/BlogCateController')
const {authMiddleware} = require("../Middleware/authMiddleware");

router.post('/addcate', authMiddleware, addCategory);
router.get('/getallcate', authMiddleware, getCategories);
router.post('/addsubcate', authMiddleware, subCategory);
router.get('/getallsubcate', authMiddleware, getSubCategories);


module.exports = router;