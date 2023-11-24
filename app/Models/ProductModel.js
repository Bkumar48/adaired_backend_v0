'use strict';
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  banner_title:{type:String, default:""},
  title:{type:String, default:""},
  strip_color:{type:String, default:""},
  main_cate_id:{type:mongoose.Schema.Types.ObjectId, ref:"productCate",default:""   },
  parent_cate_id:{type:mongoose.Schema.Types.ObjectId, ref:"productCate",default:""   },
  priceRules:{type:String, default:""},
  product_tag:{type:String, default:""},
  image:{type:String, default:""},
  description:{type:String, default:""},
  stock:{type:Number, default:""},
  min_qty:{type:Number, default:""},
  price:{type:Number, default:""},
  slug: { type: String, default:"" },
  keyword:{type:String, default:""},
  canonical_links:{type:String,default:""},
  meta_title:{type:String, default:""},
  meta_description:{type:String,default:""},
  product_status:{type:Boolean, default:1},
  delete_at:{type:Date, default:""}
  },
  { timestamps: true });

module.exports = mongoose.model("products", productSchema);