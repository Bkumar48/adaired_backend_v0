'use strict';
const PriceRules = require("../Models/PriceRuleModel")
const Product = require("../Models/ProductModel")

//******************************************************************************
// PRICE & RULES SECTION                                                            *
//******************************************************************************                                                                                
// Create Price & Rules 
const create = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
                 const { title, product_id, variants } = req.body;
                 if (!(title)) {
                     return res.status(400).send({ status: false, massage: "Rule name is required!" })
                 }
                 
                if( product_id==""){
                    return res.status(400).send({ status: false, massage: "Atleast one product select required!" })
                }
                
                if( variants[0].from==""){
                    return res.status(400).send({ status: false, massage: "Atleast one rule select required!" })
                }
                
                 const query = { title: title, product_id: product_id, variants: variants }
                 const rulesID = await PriceRules.create(query);
                 product_id.map( async (item)=>{
                    const update= await Product.updateMany({_id:item}, {$set:{priceRules:rulesID._id}})
                  })
                 return res.status(200).send({ status: true, massage: "Price & Rules is saved successfully! :)" })
            }
        
    }
    catch (err) {
        return res.status(400).send({ status: false, message: err.message })
    }
}

// get list of product Listed not listed in price and rules 
const getProductListed = async function (req, res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
    
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if( getList==true){
         const pricerules = await PriceRules.find();
         let proIds = []
         pricerules.forEach((items)=>{
            items.product_id.forEach((item2)=>{
                proIds.push(item2)
            })
         })
         
         const  product =  await Product.find({_id: {$nin:proIds}}).select(["title","_id"]);
         return res.status(200).send({ status: true, data: product })
    }
    else{
     return res.status(400).send({ status: false, massage: "Access deny!" })
    }
 }
 catch (err) {
     return res.status(400).send({ status: false, massage: err.message })
 }
}

 

 // get all list of price and rules
const getAll = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
    
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if( getList==true){
            const getList1 = await PriceRules.find().populate('product_id',['title']);
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
// get single Price and rules
const getSinglePriceRules = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
           const { rulesId } = req.query
           const pricerules = await PriceRules.find();
           let proIds = []
           pricerules.forEach((items)=>{
              items.product_id.forEach((item2)=>{
                  proIds.push(item2)
              })
           })
            let products = []
           // Push the items which not in product
           const  productNot =  await Product.find({_id: {$nin:proIds}}).select(["title","_id"]);
           productNot.map( (item)=>{
               products.push({Id:item._id,title:item.title,status:false})
         })
          // Push the items which in product on current id base
           let product = await Product.find()
           product.map( (item)=>{
                if(item.priceRules==rulesId){
                    products.push({Id:item._id,title:item.title,status:true})
                }
           })
        
              let priceRulesfind = await PriceRules.find({ _id: rulesId }).populate('product_id',['title']);
              if (priceRulesfind) {
                 return res.status(200).send({ status: true,products:products,  priceRules:priceRulesfind })
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
const updatePriceRules = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const { rulesId } = req.query
        const { title, product_id, variants } = req.body;
        const counter = variants.filter(({discount}) => {return discount ==""}).length;
         console.log(counter);
    //    console.log(Object.keys(variants));
        if (!(title)){
            return res.status(400).send({ status: false, massage: "Rule name is required!" })
        }
        
       else if( product_id==""){
           return res.status(400).send({ status: false, massage: "Atleast one product select required!" })
       }
       else if(variants==undefined){
        return res.status(400).send({ status: false, massage: "Atleast one rule select required!" })
       }
       else if(counter==1){
           return res.status(400).send({ status: false, massage: "Atleast one rule select required!" })
       }

       const existIDs =[]
        const  datalist =  await PriceRules.find({_id:rulesId})
          datalist.map((item) => {
                    item.product_id.map( async (item) => {
                                existIDs.push(item);
                //   Empty all price rules
            await Product.updateMany({_id:item}, {$set:{priceRules:''}})  
                    })
            });
            
            const query = { title: title, product_id: product_id, variants: variants }
                 product_id.map( async (item)=>{
                    // Update all price rules 
                await Product.updateMany({_id:item}, {$set:{priceRules:rulesId}})
                  })     
             // update all data
               await PriceRules.findByIdAndUpdate(rulesId, {$set:query});
             return res.status(200).send({ status: true, massage: "Price and Rules update successfully! :)" })
                }
     else{
        return res.status(400).send({ status: false, massage: "Access deny!" })
     }
}
    catch (err) {
        console.log(err);
        return res.status(400).send({ status: false, massage: err.message })
    }
}
   

// update status of price and rules

const statusPriceRules = async function(req, res){
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
                const status = (req.body.status)==1?true:false
                const { rulesId } = req.query
                const query = { status: status }
                await PriceRules.findByIdAndUpdate(rulesId, {$set:query});
                return res.status(200).send({ status: true, massage: "Price and Rules status update successfully! :)" })
       }
    else{
    return res.status(400).send({ status: false, massage: "Access deny!" })
    }
}
catch (err) {
   console.log(err);
   return res.status(400).send({ status: false, massage: err.message})
}
    
}


 // get single category data
const deletePriceRule = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].priceRules.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const { rulesId } = req.query
   
        if (getList) {

            await PriceRules.findByIdAndDelete(rulesId)
            return res.status(200).send({ status: true, massage: "Price and Rules Delete!" })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of Price and Rules here!" })
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
 
module.exports = {create, getAll, getProductListed, getSinglePriceRules, updatePriceRules, statusPriceRules, deletePriceRule}