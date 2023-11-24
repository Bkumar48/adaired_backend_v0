const asyncHandler = require("express-async-handler");
const { Category, SubCategory } = require("../Models/BlogCatModel");
// create a new category
const addCategory = asyncHandler(async (req, res) => {

   const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].blogs_cate.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
                 const cate = await Category.find();
                 console.log(cate);
                  if (cate.length > 0) {
                    let checking = false;
                          for (let i = 0; i < cate.length; i++) {
                      if (
                        cate[i]["category"].toLowerCase() === req.body.category.toLowerCase()
                      ) {
                        checking = true;
                        break;
                      }
                    }

      //console.log(checking);
      if (checking == false) {
        const category = new Category({
          category: req.body.category,
        });
        const catData = await category.save();
        res.status(200).send({ success: true, msg: "Category Saved Successfuly"  });
      } else {
        res.status(400).send({success: false, msg: "(" + req.body.category + ") Category Already Exists",
        });
      }
    } else {
      const category = new Category({
        category: req.body.category,
      });
      const catData = await category.save();
      res
        .status(200)
        .send({ success: true,msg: "Category Saved Successfuly" });
    }
  } 
  else{
    return res.status(400).send({ status: false, massage: "Access deny create blog category!" })
}
}
catch (error) {
  return res.status(400).send({ status: false, massage: "Something Wrong!" })
  }
});

// Get all categories
const getCategories = asyncHandler(async (req, res) => {
   const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].blogs_cate.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
    const categories = await Category.find().populate({
      path: "subCategories",
    });
       res.status(200).send({ success: true, data: categories });
    }
  else{
    return res.status(400).send({ status: false, massage: "Access deny read blog category!" })
} 
} catch (error) {
  return res.status(400).send({ status: false, massage: "Something Wrong!" })
  }
});

 

// Create a Sub Category
const subCategory = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].blogs_cate.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
    const subcate = await SubCategory.find();
    if (subcate.length > 0) {
      let checking = false;
      for (let i = 0; i < subcate.length; i++) {
        if (
          subcate[i]["subcategory"].toLowerCase() ===
          req.body.subcategory.toLowerCase()
        ) {
          checking = true;
          break;
        }
      }
      if (checking == false) {
         const category = await Category1.findById(req.body.categoryId);
         const subcategory = await SubCategory({
               subcategory: req.body.subcategory,
               parentCategory: req.body.categoryId,
        }).save();
         category.subCategories.push(subcategory);
         await category.save();
         res.status(200).send({status: true,  message: "Sub Category Created Succesfully" });
       }
      else {
      res.status(400).send({status: false, message:" (" + req.body.subcategory + ") Sub Category Already Exists "});
      }
    } else {
      const category = await Category.findById(req.body.categoryId);
         const subcategory = await SubCategory({
               subcategory: req.body.subcategory,
               parentCategory: req.body.categoryId,
        }).save();
         category.subCategories.push(subcategory);
         await category.save();
       ree.status(200).send({ status: true, message: "Sub Category Created Succesfully" });
    }
  }
  else{
    return res.status(400).send({ status: false, message: "Access deny create blog sub category!" })
} 
} catch (error) {
  return res.status(400).send({ status: false, message: error.message })
   }
});

// Get all Sub Categories
const getSubCategories = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs_cate.read== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
       const subcategories = await SubCategory.find().populate({
      path: "parentCategory",
    });
    res.status(200).send({success: true,  data: subcategories });
  }
  else{
    return res.status(400).send({ status: false, message: "Access deny read blog sub category!" })
} 
}
  catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

module.exports = { addCategory, subCategory, getCategories, getSubCategories };
