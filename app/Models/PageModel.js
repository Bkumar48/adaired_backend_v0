'use strict';
const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title:{type:String, default:""},
  image:{type:String, default:""},
  description:{type:String, default:""},
  slug: { type: String, default:"" },
  keyword:{type:String, default:""},
  canonical_links:{type:String,default:""},
  meta_title:{type:String, default:""},
  meta_description:{type:String,default:""},
  product_status:{type:Boolean, default:1},
  },
  { timestamps: true });

module.exports = mongoose.model("pages", pageSchema);