const mongoose = require("mongoose");
const productCateSchema = new mongoose.Schema({
  name:{type:String, default:""},
  parent_id:{type:String, ref:"procate", default:""},
  image:{type:String, default:""},
  description:{type:String, default:""},
  slug: { type: String, default:"" },
  },
  { timestamps: true });

module.exports = mongoose.model("procate", productCateSchema);