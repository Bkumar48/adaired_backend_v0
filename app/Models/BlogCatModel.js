// const mongoose = require("mongoose"); // Erase if already required

// // Sub Category Schema
// var SubCategorySchema = new mongoose.Schema(
//   {
//     subcategory: {
//       type: String,
//       default:""
//     },
//   parentCategory: [{ type: mongoose.Types.ObjectId, ref: "BlogCategory"}]
// });

// const SubCategory = mongoose.model('BlogSubCategory', SubCategorySchema);


// // Category Schema
// var CategorySchema = new mongoose.Schema({


//     category: {
//         type: String,
//         required: true
//       }, 
//   subCategories: [{ type: mongoose.Types.ObjectId, ref: "BlogSubCategory" }]
// });

// const Category = mongoose.model('BlogCategory', CategorySchema);


// module.exports = {Category, SubCategory};
