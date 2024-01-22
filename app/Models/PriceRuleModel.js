'use strict';
const mongoose = require("mongoose");

const PriceRulesSchema = new mongoose.Schema({
  title:{type:String, default:""},
  product_id:[{type:mongoose.Schema.Types.ObjectId, ref:"products"}],
  variants:[{
             from:{type:Number,default:""},
             to:{type:Number,default:""},   
             discount:{type:Number,default:""},
    }],
   status:{type:Boolean, default:true} 
   },
  { timestamps: true });

module.exports = mongoose.model("priceRule", PriceRulesSchema);