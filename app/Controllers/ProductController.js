'use strict';
const prodCategory = require("../Models/CategoryProdModel");
const product = require("../Models/ProductModel")
const upload = require("../Middleware/fileUpload")
const {productImg,categoryImg} = require("../Middleware/fileUpload")
const slugify = require("slugify");
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { isNumber } = require("util");
require('dotenv').config();
 
//******************************************************************************
// CATEGORY SECTION                                                            *
//******************************************************************************                                                                                
// Add product Category 
const productCateAdd = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product_cate.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        await categoryImg(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ status: false, massage: "Please check the image format" })
            } else {
                const image = req.file ? req.file.filename : req.file?.filename
                const { cate_name, description, slug } = req.body;
                const parent_id = req.body.parent_id ? req.body.parent_id : 0;
                const checkSlug = await prodCategory.findOne({ slug: slug }).count();
                if (checkSlug>=1) {
                    return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                }
               
                if (!(cate_name)) {
                    return res.status(400).send({ status: false, massage: "Category name field is required!" })
                }
                if (!(description)) {
                    return res.status(400).send({ status: false, massage: "Description field is required!" })
                }
                if (!(slug)) {
                    return res.status(400).send({ status: false, massage: "Slug field is required!" })
                }
                const query = { name: cate_name, image: image, parent_id: parent_id, description: description, slug: slugify(slug) }
                await prodCategory.create(query);
                return res.status(200).send({ status: true, massage: "Category insert successfully! :)" })
            }
        })
        }
        else{
            return res.status(400).send({ status: false, massage: "Access deny!" })
        }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}

 // get list of category
const productCateList = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product_cate.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
    
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if( getList==true){
            const getList1 = await prodCategory.find();
            if (getList1) {
                return res.status(200).send({ status: true, data: getList1 })
            }
            else {
                return res.status(400).send({ status: false, massage: "No List of category here!" })
            }
        }
       else{
        return res.status(400).send({ status: false, massage: "Access deny!" })
       }
      
        
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}
// get single category data
const getSingleCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product_cate.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
           const { category_Id } = req.query
            const getList = await prodCategory.findOne({ _id: category_Id });
                if (getList) {
                return res.status(200).send({ status: true, data: getList })
            }
            else {
            return res.status(400).send({ status: false, massage: "No List of category here!" })
            }
        }
        else{
            return res.status(400).send({ status: false, massage: "Access deny!" })
        }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}

// update category 
const updateSingleCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product_cate.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const { category_Id } = req.query
        const directoryPath = process.env.UPLOAD_CATEGORY;
        const getList = await prodCategory.findOne({ _id: category_Id });
        if (getList) {
            await categoryImg(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({ status: false, massage: "Please check the image format" })
                } else {
                    const image = req.file ? req.file.filename : req.file?.filename
                    // check the file is exist in upload time 
                    if(image){
                         let oldFileName = '';
                         const oldImage =   await prodCategory.findOne({ _id: category_Id })
                                             oldFileName = oldImage.image
                                             //  console.log(oldFileName);
                                               fs.unlink(directoryPath + oldFileName, (err) => {
                                                    // if (err) {
                                                    //     res.status(500).send({
                                                    //         message: "Could not delete the file. " + err,
                                                    //     });
                                                    // }
                                                // res.status(200).send({
                                                //  message: "File is deleted.",
                                                // });
                                           });
                        }
                    const { cate_name, description, slug } = req.body;
                    const parent_id = req.body.parent_id ? req.body.parent_id : 0;
                    const checkSlug = await prodCategory.findOne({slug:slug}).where({ "_id": { "$ne": category_Id }}).count();
                   if (checkSlug ==1) {
                        return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                    }
                    if (!(cate_name)) {
                        return res.status(400).send({ status: false, massage: "Category name field is required!" })
                    }
                    if (!(description)) {
                        return res.status(400).send({ status: false, massage: "Description field is required!" })
                    }
                    if (!(slug)) {
                        return res.status(400).send({ status: false, massage: "Slug field is required!" })
                    }
                    const query = { name: cate_name, image: image, parent_id: parent_id, description: description, slug: slugify(slug) }
                    await prodCategory.findByIdAndUpdate(category_Id, {$set:query});
                    return res.status(200).send({ status: true, massage: "Category update successfully! :)" })
                }
            })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of category here!" })
        }
    }
    else{
        return res.status(400).send({ status: false, massage: "Access deny!" })
    }
}
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}
   
 // get single category data
const deleteCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product_cate.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const { category_Id } = req.query
        const getList = await prodCategory.findOne({ _id: category_Id });
        if (getList) {

            // check the id is parent exist in Category  
            const checkCategoryId = await prodCategory.find({ parent_id: category_Id }).count();;
            if (checkCategoryId > 0) {
                return res.status(400).send({ status: false, massage: "Category is exist in subcategory !" })
            }
            let oldFileName = '';
            const directoryPath = process.env.UPLOAD_CATEGORY;
            const oldImage = await prodCategory.findOne({ _id: category_Id })
            oldFileName = oldImage.image
            // check in files is exist in database
            if (oldFileName) {
                fs.unlink(directoryPath + oldFileName, (err) => {
                });
            }
            await prodCategory.findByIdAndDelete(category_Id)
            return res.status(200).send({ status: true, massage: "Category Delete!" })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of category here!" })
        }
       }
       else{
        return res.status(400).send({ status: false, massage: "Access deny!" })
       }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}
  
//******************************************************************************
// PRODUCT SECTION                                                             *     
//******************************************************************************          
// Create product                                                                       
const productAdd = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        await productImg(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ status: false, massage: "Please check the image format" })
            } else {
                const { banner_title, title, strip_color, parent_cate_id, main_cate_id, product_tag, description, stock, min_qty, price, slug, keyword, canonical_links, meta_title, meta_description } = req.body
                const image = req.file ? req.file.filename : ""
                const Imin_qty = parseInt(min_qty);
                const Istock = parseInt(stock);
                const Iprice = parseFloat(price);


                if (!banner_title) {
                    return res.status(400).send({ status: false, massage: "Banner Title field is required!" })
                }

                if (!title) {
                    return res.status(400).send({ status: false, massage: "Title field is required!" })
                }

                // if (!main_cate_id) {
                //     return res.status(400).send({ status: false, massage: "Main category is required!" })
                // }

                if (!parent_cate_id) {
                    return res.status(400).send({ status: false, massage: "Sub category is required!" })
                }
                
                if (!product_tag) {
                    return res.status(400).send({ status: false, massage: "Product tag is required!" })
                }

                if (!price) {
                    return res.status(400).send({ status: false, massage: "Price is required!" })
                }

                if (!slug) {
                    return res.status(400).send({ status: false, massage: "Slug is required!" })
                }

                // checking Slug    
                const checkSlug = await product.findOne({ slug: slug }).count();
                if (checkSlug > 1) {
                    return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                }
                const query = {
                    banner_title: banner_title, title: title, strip_color: strip_color, parent_cate_id: parent_cate_id, main_cate_id: main_cate_id, product_tag: product_tag, image: image, description: description,
                    stock: Istock, min_qty: Imin_qty, price: Iprice, slug: slugify(slug), keyword: keyword, canonical_links: canonical_links, meta_title: meta_title, meta_description: meta_description
                }
                await product.create(query);
                return res.status(200).send({ status: true, massage: "Product create successfully! :)" })
            }
        })
        }
        else{
            return res.status(400).send({ status: false, massage: "Access deny!" })  
        }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
      
    }
}
 
// Get single Product
const getSingleProduct = async function(req, res){
    
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
           const {productId} = req.query
            const checkProduct = await product.findOne({_id:productId});
            if(!checkProduct){
                return res.status(400).send({ status: false, massage: "Please check the id" })
            }
            return res.status(200).send({ status: true, dataProduct:checkProduct  })
      }
     else{
        return res.status(400).send({ status: false, massage: "Access deny!" })  
    }
  }
    catch (err){
        return res.status(400).send({ status: false, massage: err.message })
    }
}
  
// update single product
const updateProduct = async function(req,res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        await productImg(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ status: false, massage: "Please check the image format" })
            }
            const { productId } = req.query
            const checkProduct = await product.findOne({ _id: productId });
            if (!checkProduct) {
                return res.status(400).send({ status: false, massage: "Please check the id" })
            }
            const { banner_title, title, strip_color, parent_cate_id, main_cate_id, product_tag, description, stock, min_qty, price, slug, keyword, canonical_links, meta_title, meta_description } = req.body
            const image = req.file ? req.file.filename : ""
            const Imin_qty = parseInt(min_qty);
            const Istock = parseInt(stock);
            const Iprice = parseFloat(price);
            const directoryPath = process.env.UPLOAD_PRODUCT;
            if (!banner_title) {
                return res.status(400).send({ status: false, massage: "Banner Title field is required!" })
            }

            if (!title) {
                return res.status(400).send({ status: false, massage: "Title field is required!" })
            }
            if (!main_cate_id) {
                return res.status(400).send({ status: false, massage: " Main category is required!" })
            }
            
            if (!parent_cate_id) {
                return res.status(400).send({ status: false, massage: "Sub category is required!" })
            }

         
            
            if (!product_tag) {
                return res.status(400).send({ status: false, massage: "Product tag is required!" })
            }

            if (!price) {
                return res.status(400).send({ status: false, massage: "Price is required!" })
            }

            if (!slug) {
                return res.status(400).send({ status: false, massage: "Slug is required!" })
            }

            const checkSlug = await product.findOne({slug:slug}).where({ "_id": { "$ne": productId }}).count();
             if (checkSlug ==1) {
                  return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
              }

            // check image in upload
            if (image) {
                let oldFileName = '';
                const oldImage = await product.findOne({ _id: productId })
                oldFileName = oldImage.image
                fs.unlink(directoryPath + oldFileName, (err) => { });
             }
            // update query 
            const query = {
                banner_title: banner_title, title: title, strip_color: strip_color, parent_cate_id: parent_cate_id, main_cate_id: main_cate_id, product_tag: product_tag, image: image, description: description,
                stock: Istock, min_qty: Imin_qty, price: Iprice, slug: slugify(slug), keyword: keyword, canonical_links: canonical_links, meta_title: meta_title, meta_description: meta_description
            }
            await product.findByIdAndUpdate({ _id: productId }, { $set: query })
            return res.status(200).send({ status: true, massage: "Product update successfully! :)" })
        })
        }
        else{
            return res.status(400).send({ status: false, massage: "Access deny!" })  
           }
      }
    catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}
// Product get all
const allProduct = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const allPro = await product.find();
        if (!allPro) {
            return res.status(400).send({ status: false, massage: "There is no product availbale" })
        }
        return res.status(200).send({ status: true, proData: allPro })
    }
    else{
        return res.status(400).send({ status: false, massage: "Access deny!" })  
       }
    }
    catch (err) {
      
        return res.status(400).send({ status: false, massage: err.message })
    }
}

// Product delete 
const deletePro = async function(req,res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const { productId } = req.query
        const getList = await product.findOne({ _id: productId });
        if (getList) {
            let oldFileName = '';
            const directoryPath = process.env.UPLOAD_PRODUCT;
             oldFileName = getList.image
            // check in files is exist in database
            if (oldFileName) {
                fs.unlink(directoryPath + oldFileName, (err) => {
                });
            }
            await product.findByIdAndDelete(productId)
            return res.status(200).send({ status: true, massage: "Product Delete!" })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of category here!" })
        }
       }
       else{
        return res.status(400).send({ status: false, massage: "Access deny!" })  
       }
    }
     catch (err){ 
        return res.status(400).send({ status: false, massage: err.message })
     }

}

// Product change status 
 const productStatus = async function(req, res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].product.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
         const {productId} = req.query
         const {product_status} = req.body
         const checkData = await  product.findOne({_id:productId})
         if(!checkData){
            return res.status(400).send({ status: false, massage: "Please check the product ID!" })
         }
         const query = { product_status:product_status}
         await product.findByIdAndUpdate({ _id: productId }, { $set: query })
         return res.status(200).send({ status: true, massage: "Product status changed successfully! :)" })
        }
        else{
         return res.status(400).send({ status: false, massage: "Access deny!" })  
        }
        }
    catch (err){
    
        return res.status(400).send({ status: false, massage: err.message })
    }

 }




module.exports = {productCateAdd, productCateList,  getSingleCate, updateSingleCate, deleteCate, productAdd, getSingleProduct, updateProduct, allProduct, deletePro, productStatus}