'use strict';
const faqCategory = require("../Models/CategoryFaqModel")
const faqs = require("../Models/FaqsModel")
const {faqImg} = require("../Middleware/fileUpload")
const slugify = require("slugify");
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { isNumber } = require("util");
require('dotenv').config();
const directoryPath = process.env.UPLOAD_FAQ;

//******************************************************************************
// CATEGORY SECTION                                                            *
//******************************************************************************                                                                                
// Add FAQ Category 
const faqCateAdd = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq_cate.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        await faqImg(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ status: false, massage: "Please check the image format" })
            } else {
                const image = req.file ? req.file.filename : req.file?.filename
                const { cate_name, description, slug } = req.body;
                const parent_id = req.body.parent_id ? req.body.parent_id : 0;
                const checkSlug = await faqCategory.findOne({ slug: slug }).count();
                if (checkSlug > 1) {
                    return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                }
                if (!(cate_name)) {
                    return res.status(400).send({ status: false, massage: "Category name field is required!" })
                }
                // if (!(description)) {
                //     return res.status(400).send({ status: false, massage: "Description field is required!" })
                // }
                if (!(slug)) {
                    return res.status(400).send({ status: false, massage: "Slug field is required!" })
                }
                const query = { name: cate_name, image: image, parent_id: parent_id, description: description, slug: slugify(slug) }
                await faqCategory.create(query);
                return res.status(200).send({ status: true, massage: "FAQ category insert successfully! :)" })
            }
        })
    }
    else{
     return res.status(400).send({ status: false, massage: "Access deny!" })  
    }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}

 // Get list of category in FAQ
const faqCateList = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq_cate.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const getList = await faqCategory.find();
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
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
// get single FAQ category 
const getSinglefaqCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq_cate.read== true
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
        const getList = await faqCategory.findOne({ _id: category_Id });
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
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}

// update FAQ category 
const updateSinglefaqCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq_cate.update== true
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
        const getList = await faqCategory.findOne({ _id: category_Id });
        if (getList) {
            await faqImg(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({ status: false, massage: "Please check the image format" })
                } else {
                    const image = req.file ? req.file.filename : req.file?.filename
                      // check the file is exist in upload time 
                    if(image){
                         let oldFileName = '';
                         const oldImage =   await faqCategory.findOne({ _id: category_Id })
                                             oldFileName = oldImage.image
                                               fs.unlink(directoryPath + oldFileName, (err) => {
                                               // console.log(err);
                                           });
                        }
                    const { cate_name, description, slug } = req.body;
                    const parent_id = req.body.parent_id ? req.body.parent_id : 0;
                    const checkSlug = await faqCategory.findOne({ slug: slug }).count();
                    if (checkSlug > 1) {
                        return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                    }
                    if (!(cate_name)) {
                        return res.status(400).send({ status: false, massage: "Category name field is required!" })
                    }
                    // if (!(description)) {
                    //     return res.status(400).send({ status: false, massage: "Description field is required!" })
                    // }
                    if (!(slug)) {
                        return res.status(400).send({ status: false, massage: "Slug field is required!" })
                    }
                    const query = { name: cate_name, image: image, parent_id: parent_id, description: description, slug: slugify(slug) }
                    await faqCategory.findByIdAndUpdate(category_Id, {$set:query});
                    return res.status(200).send({ status: true, massage: "FAQ category update successfully! :)" })
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
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
   
// Delete FAQ Category
const deleteFaqCate = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq_cate.delete== true
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
        const getList = await faqCategory.findOne({ _id: category_Id });
        if (getList) {
             // check the id is parent exist in Category  
            const checkCategoryId = await faqCategory.find({ parent_id: category_Id }).count();;
            if (checkCategoryId > 0) {
                return res.status(400).send({ status: false, massage: "Category is exist in subcategory !" })
            }
            let oldFileName = '';
            const oldImage = await faqCategory.findOne({ _id: category_Id })
             oldFileName = oldImage.image
            // check in files is exist in database
            if (oldFileName) {
                fs.unlink(directoryPath + oldFileName, (err) => {
                });
            }
            await faqCategory.findByIdAndDelete(category_Id)
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
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
  
//******************************************************************************
// FAQ SECTION                                                                 *     
//******************************************************************************          
// Create FAQ                                                                       
const faqAdd = async function (req, res) {
    
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
               const {title,  parent_cate_id, sub_cate_id,  description } = req.body
             //  console.log(sub_cate_id);
               let query ="";
               if (!title) {
                    return res.status(400).send({ status: false, massage: "Title field is required!" })
                }

                if (!parent_cate_id) {
                    return res.status(400).send({ status: false, massage: "Category is required!" })
                }

                if(sub_cate_id!="undefined"){
                  query = {title: title, parent_cate_id: parent_cate_id, sub_cate_id: sub_cate_id,  description: description}       
                }
                else{
                    query = {title: title, parent_cate_id: parent_cate_id,  description: description}
                }
                await faqs.create(query);
                return res.status(200).send({ status: true, massage: "FAQ is create successfully! :)" })
            }
            else{
             return res.status(400).send({ status: false, massage: "Access deny!" })  
            }
        }
    catch (err) {
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
 
// Get single FAQ
const getSinglefaq = async function(req, res){

    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
           const {faqId} = req.query
             const faqData = await faqs.findOne({_id:faqId});
            if(!faqData){
                return res.status(400).send({ status: false, massage: "Please check the id" })
            }
            return res.status(200).send({ status: true, dataProduct:faqData  })
        }
        else{
         return res.status(400).send({ status: false, massage: "Access deny!" })  
        }
      }
    catch (err){
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
  
// update FAQ
const updateFaq = async function(req,res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
            const { faqId } = req.query
            const checkfaq = await faqs.findOne({ _id: faqId });
            if (!checkfaq) {
                return res.status(400).send({ status: false, massage: "Please check the id" })
            }
               const {title,  parent_cate_id, sub_cate_id, description} = req.body
         
            if (!title) {
                return res.status(400).send({ status: false, massage: "Title field is required!" })
            }

            if (!parent_cate_id) {
                return res.status(400).send({ status: false, massage: "Category is required!" })
            }
            // update query 
            const query = {title: title,  parent_cate_id: parent_cate_id, sub_cate_id: sub_cate_id,  description: description}
            await faqs.findByIdAndUpdate({ _id: faqId }, { $set: query })
            return res.status(200).send({ status: true, massage: "FAQ update successfully! :)" })
        }
        else{
         return res.status(400).send({ status: false, massage: "Access deny!" })  
        }
     }
    catch (err) {
            return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
// get all FAQ
const allFaq = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const limitValue = parseInt(req.query.limit || 2);
        const skipValue = parseInt(req.query.skip || 0);

        const allfaqs = await faqs.find().limit(limitValue).skip(skipValue);
        if (!allfaqs) {
            return res.status(400).send({ status: false, massage: "There is no FAQ availbale" })
        }
        return res.status(200).send({ status: true, proData: allfaqs })
    }
    else{
     return res.status(400).send({ status: false, massage: "Access deny!" })  
    }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}

// Faq delete 
const deleteFaq = async function(req,res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const { faqId } = req.query
        const getList = await faqs.findOne({ _id: faqId });
        if (getList) {
            await faqs.findByIdAndDelete(faqId)
            return res.status(200).send({ status: true, massage: "FAQ Delete!" })
        }
        else {
            return res.status(400).send({ status: false, massage: "FAQ id is not exist!" })
        }
    }
    else{
     return res.status(400).send({ status: false, massage: "Access deny!" })  
    }
    }
     catch (err){ 
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
     }

}

// Product change status 
 const productStatus = async function(req, res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].faq.update== true
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
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }

 }




module.exports = {faqCateAdd, faqCateList,  getSinglefaqCate, updateSinglefaqCate, deleteFaqCate, faqAdd, getSinglefaq, updateFaq, allFaq, deleteFaq, productStatus}