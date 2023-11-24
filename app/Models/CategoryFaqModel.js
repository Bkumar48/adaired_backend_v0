const mongoose = require("mongoose");

const faqCateSchema = new mongoose.Schema({
  name:{type:String, default:""},
  parent_id:{type: String,default:""   },
  image:{type:String, default:""},
  description:{type:String, default:""},
  slug: { type: String, default:"" },
  },
  { timestamps: true });

module.exports = mongoose.model("faqCate", faqCateSchema);