'use strict';
const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  code:{type:String, default:""},
  discount:{type:Number, default:""},
  discountType:{type:Number, enum:[1,2], default:""},
  expire:{type:String, default:""},
  expireStatus:{type:Boolean, enum:[true, false], default:true},
  copounUsedBy:[{type:mongoose.Schema.Types.ObjectId,ref: "User"}],
  copounUsed:{type:Number, default:""},
  status:{type:Boolean, enum:[true, false], default:""},
  deleted_at:{type : Date, default:""}
 },
  { timestamps: true });

module.exports = mongoose.model("copoun", CouponSchema);