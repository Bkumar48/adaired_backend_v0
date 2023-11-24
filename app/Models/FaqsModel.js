'use strict';
const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  title:{type:String, default:""},
  parent_cate_id:{type:mongoose.Schema.Types.ObjectId, ref:"faqCate",default:"" },
  sub_cate_id:{type:mongoose.Schema.Types.ObjectId, ref:"faqCate",default:"" },
  description:{type:String, default:""},
  faq_status:{type:Boolean, default:1},
  },
  { timestamps: true });

module.exports = mongoose.model("faqs", faqSchema);