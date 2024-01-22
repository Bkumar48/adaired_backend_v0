'use strict';
const prodCategory = require("../Models/CategoryProdModel");
const product = require("../Models/ProductModel")
const faqs = require("../Models/FaqsModel")
const faqCategory = require("../Models/CategoryFaqModel")
const blog = require("../Models/BlogModal")
require('dotenv').config();


// Product get all
const allProduct = async function (req, res) {
    try {
        
        const proData = []
        const categoryId = req.query.categoryId?req.query.categoryId:0
        const productId = req.query.productId?req.query.productId:0
        const maincateId = req.query.maincateId?req.query.maincateId:0
        const search =  req.query.search?req.query.search:0
        const limitValue = parseInt(req.query.limit || 10);
        const skipValue = parseInt(req.query.skip || 0);
        let query = "";

    //    Get single product
        if(productId!=0){
            query = {product_status:true, _id:productId,delete_at:null}
        }
    //    Get product by main category ID
        else if(maincateId!=0){
            query = {product_status:true, main_cate_id:maincateId,delete_at:null}
        }
    //    Get product by sub category ID
        else if(categoryId!=0){
            query = {product_status:true, parent_cate_id:categoryId,delete_at:null}
        }
    //    Get product by search 
        else if(search!=0){
            query = {product_status:true, banner_title:{ $regex: search, $options: "xi"},delete_at:null}
            console.log(query);
        }
        else{
            query = {product_status:true,delete_at:null}
        }
       
        const allPro = await product.find(query).limit(limitValue).skip(skipValue).populate({ path: "parent_cate_id", model: "procate"});
        const countProduct = await product.find(query).limit(limitValue).skip(skipValue).count();
       if(countProduct>0){
        allPro.map((element)=>{
          
            proData.push({  Id:element._id,
                            banner_title:element.banner_title,
                            strip_color:element.strip_color,
                            type:element.parent_cate_id.name,
                            image:element.image,
                            description:element.description,
                            min_qty:element.min_qty,
                            price:element.price, 
                        })  
                 })
        return res.status(200).send({ status: true, total:countProduct, proData: proData })
       }
        else{
            return res.status(200).send({ status: false, massage: "There is no product availbale", proData: proData })
        }
    }
   catch (err) {
        return res.status(400).send({ status: false, massage: err.message })
    }
}

// Product Menus 
const productMenu = async function(req,res){
    try {
    const parentId = req.query.parentId?req.query.parentId:0
    let query = ""
    const childMenu = []
   // Find the parent menu
    const menu =  await prodCategory.find();
      const menus = []  
           menu.map(async (element)  =>{
                if(element.parent_id==0){
                          menus.push({
                            parentName:element.name,
                            parentId:element._id
                        })
                    }
                
             })
   // Find the child menu
     if(parentId!=0){
        query ={parent_id:parentId}
     
      const child =  await prodCategory.find(query);
               child.map(async (element)  =>{ 
                childMenu.push({
                        childName:element.name,
                        childId:element._id
                    })
                 })
        }
       // console.log(menus);
     return res.status(200).send({ status: true,   parentMenu: menus, childMenu:childMenu })
    }
    catch (err) {
         return res.status(400).send({ status: false, massage: err.message })
     }
}

// faq page
const faqPage =  async function(req, res){
    try {
    const categoryId = req.query.categoryId?req.query.categoryId:0
    let query = ""
    if(categoryId!=0){
        query = {parent_cate_id:categoryId,faq_status:true}
    }
    else{
        query = {faq_status:true}
    }
  const allfaqs = await faqs.find(query);
    if (!allfaqs) {
        return res.status(400).send({ status: false, massage: "There is no FAQ availbale" })
    }
    return res.status(200).send({ status: true, proData: allfaqs })
}
catch (err) {
     return res.status(400).send({ status: false, massage: err.message })
 }
}

// faq menu
 const faqMenu = async function(req, res){
    try {
    const category = await faqCategory.find()
    return res.status(200).send({ status: true, proData: category })
    }
    catch (err) {
     return res.status(400).send({ status: false, massage: err.message })
  }
 }

// blogs
const blogs = async function (req, res){
    try {
         const blogId = req.query.blogId?req.query.blogId:0 
         const limitValue = parseInt(req.query.limit || 10);
         const skipValue = parseInt(req.query.skip || 0);
        let query = ""
         if(blogId!=0){
            query = {_id:blogId}
         }
         else{
            query = {}
         }
        
         const blogList = await blog.find(query).limit(limitValue).skip(skipValue)
         const countBlog =  await blog.find(query).count();
         if(countBlog>0){
            return res.status(200).send({ status: true, proData: blogList })
         }
         else{
            return res.status(400).send({ status: false, massage: "There is no FAQ availbale" })
         }
        }
        catch (err) {
         return res.status(400).send({ status: false, massage: err.message })
      }
} 

module.exports = { allProduct,productMenu,faqPage,faqMenu,blogs }