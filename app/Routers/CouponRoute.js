const express = require('express');
const { createCoupon, getAllCoupons, updateCoupon, changeStatus, deleteCoupon, couponExpire, getOneCoupon } = require('../Controllers/CouponController');
const { authMiddleware} = require('../Middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware,  createCoupon); 
router.get('/getall', authMiddleware,  getAllCoupons); 
router.get('/getSingle', authMiddleware,  getOneCoupon); 
router.put('/changeStatus', authMiddleware,  changeStatus); 
router.put('/update', authMiddleware,  updateCoupon); 
router.get("/couponExpire",authMiddleware, couponExpire)
router.delete('/delete', authMiddleware, deleteCoupon); 



module.exports = router;