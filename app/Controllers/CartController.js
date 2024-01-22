'use strict';
const cartRepository = require('../Helpers/CartHelper')
const productModel = require("../Models/ProductModel");
const priceRules = require("../Models/PriceRuleModel") 

// Add to cart
const addCart = async function (req, res, next) {
        const UserInfo = req.userId;
        const userID = UserInfo._id;
        const productId = req.body.productId;
        const quantity = parseInt(req.body.qty)
        let discountPrice = []
        let cart = await cartRepository.cart(userID);
        var { ObjectId } = require('mongodb');

        try {
            const productDetails = await productModel.findOne({ _id: productId });
            let priceDiscount = await priceRules.find({ product_id: productId, status: true })
            priceDiscount.forEach(element => {
                element.variants.forEach(element => {
                    if (element.from <= quantity && element.to >= quantity) {
                        discountPrice.push(element.discount)
                    }
                })
            }
            )
            if (!productDetails) {
                return res.status(500).json({
                    type: "Not Found",
                    msg: "Product not found"
                })
            }
            //--If Cart Exists ----
            if (cart) {
            // Find the existing item with the same product ID
            const existingItem = cart.items.find(item => item.productId._id.toString() === productId);

            //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
            if (existingItem) {
                let dPrice = (discountPrice[0]) ? productDetails.price - (productDetails.price * (discountPrice[0]) / 100) : "";
                let price = (dPrice) ? dPrice : productDetails.price;

                existingItem.quantity += quantity > productDetails.min_qty ? quantity : productDetails.min_qty;
                existingItem.total = Math.round(existingItem.quantity * price * 100) / 100;
                existingItem.price = productDetails.price;
                existingItem.discountPrice = Math.round(dPrice * 100) / 100;
                existingItem.discount = (discountPrice[0]) ? discountPrice[0] : "";

                cart.subTotal = Math.round(cart.items.map(item => item.total).reduce((acc, next) => acc + next) * 100) / 100;
            } else {
                    //----if product not exist push new item----
                    let dPrice = (discountPrice[0]) ? productDetails.price - (productDetails.price * (discountPrice[0]) / 100) : ""
                    let price = (dPrice) ? dPrice : productDetails.price;
                    cart.items.push({
                        productTile: productDetails.title,
                        productId: ObjectId(productId),
                        quantity: quantity > productDetails.min_qty ? quantity : productDetails.min_qty,
                        total: Math.round(quantity * price * 100) / 100,
                        price: productDetails.price,
                        discountPrice: Math.round(dPrice * 100) / 100,
                        discount: (discountPrice[0]) ? discountPrice[0] : ""
                    });
                    cart.subTotal = Math.round(cart.items.map(item => item.total).reduce((acc, next) => acc + next) * 100) / 100;
                }
                let data = await cart.save();
                 let cart1 = await cartRepository.cart(data.userId);
                return res.status(200).send({ status: true, message: "Cart update successfully :)", cart1 })
            } else {
                //----if cart not exist create new cart----
                const cartData = {
                    userId: ObjectId(userID),
                    items: [{
                        productTile: productDetails.title,
                        productId: ObjectId(productId),
                        quantity: quantity > productDetails.min_qty ? quantity : productDetails.min_qty,
                        total: Math.round(quantity * productDetails.price * 100) / 100,
                        price: productDetails.price,
                        discountPrice: Math.round(productDetails.price * 100) / 100,
                        discount: ""
                    }],
                    subTotal: Math.round(quantity * productDetails.price * 100) / 100,
                };
                let data = await cartRepository.addItem(cartData);
                        let cart1 = await cartRepository.cart(data.userId);
                return res.status(200).send({ status: true, message: "Cart update successfully :)", cart1 });
            }
        }
        catch (err) {
            return res.status(400).send({ status: false, message: err.message })
        }
    }


// Above that i've changed the code
 
const updateQty =  async function (req, res, next) {
    const UserInfo = req.userId
    const userID = UserInfo._id;
    const cartproductId = req.body.cartproductId;
    let   productIdget = []
    const quantity = parseInt(req.body.qty)
    let discountPrice = []
    let cart = await cartRepository.cart(userID);
    var {ObjectId} = require('mongodb');
    // Get product cart id to ingore the duplicate of product in cart


    cart.items.map( (item) => {
           if(item._id.toString()==cartproductId.toString()){
                  productIdget.push(item.productId._id);
           }
    })
   let productId = productIdget[0];
   
   
    try{
        let productDetails = await productModel.findOne({_id:productId})
         let priceDiscount =  await priceRules.find({product_id:productId, status:true})
         priceDiscount.forEach( element => {
            element.variants.forEach( element => {
               if(element.from<=quantity && element.to>=quantity ){
                    discountPrice.push(element.discount)
                }
            })    
        })
      if (!productDetails) {
        return res.status(500).json({
            type: "Not Found",
            msg: "Invalid request"
        })
    }
     //--If Cart Exists ----
     if (cart) {
        //---- Check if index exists ----
     //   console.log(productId);
        const indexFound = cart.items.findIndex(item => item._id == cartproductId);
         //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
         if (indexFound !== -1 ) {
               let dPrice = (discountPrice[0])?productDetails.price-(productDetails.price * (discountPrice[0])/100):""
               let price = (dPrice)?dPrice:productDetails.price;
               cart.items[indexFound].quantity = quantity>productDetails.min_qty?quantity:productDetails.min_qty ;
               cart.items[indexFound].total = Math.round(cart.items[indexFound].quantity * price*100)/100
               cart.items[indexFound].price = productDetails.price;
               cart.items[indexFound].discountPrice = Math.round(dPrice*100)/100;
               cart.items[indexFound].discount = (discountPrice[0])?discountPrice[0]:"";
               cart.subTotal =  Math.round(cart.items.map(item =>item.total).reduce((acc, next) => acc + next)*100)/100;
        }
        let data = await cart.save();
        // return res.status(200).send({ status: true, message: "Cart update successfully :)" })
                return res.status(200).send({ status: true, message: "Cart update successfully :)", data })
     }
   }    
    catch (err){
        return res.status(400).send({ status: false, message: err.message })
    }
    
 }

// Remove and empty cart 
const remProductCart =  async function (req, res, next) {
    const UserInfo = req.userId
    const userID = UserInfo._id;
    const productId = req.body.productId;
    let cart = await cartRepository.cart(userID);
  
    try{
        let productDetails = await productModel.findOne({_id:productId})
     if (!productDetails) {
        return res.status(500).json({
            type: "Not Found",
            msg: "Invalid request"
        })
    }
     //--If Cart Exists ----
     if (cart) {
        //---- Check if index exists ----
        const indexFound = cart.items.findIndex(item => item.productId._id == productId);
        //----------Check if product exist, just add the previous quantity with the new quantity and update the total price-------
          if (indexFound>=0 ) {
               const deletedProduct = cart.items[indexFound];
                 cart.subTotal -= deletedProduct.price * deletedProduct.quantity; 
                  cart.items.splice(indexFound, 1);
                   await cart.save();
                   //  Cart empty
                   if(cart.items.length==0){
                    let cart = await cartRepository.deleteCart(userID);
                     return res.status(200).send({ status: true, message: "Cart empty successfully :)"  })
                    }
                   return res.status(200).send({ status: true, message: "Product remove from cart successfully :)"  })
              }
        }
   }    
    catch (err){
        return res.status(400).send({ status: false, message: err.message })
    }
}

// cart information 

const getCart = async (req, res) => {
    const UserInfo = req.userId
    const userID = UserInfo._id;
    try {
        let cart = await cartRepository.cart(userID)
        if (!cart) {
           return res.status(400).json({status: false, msg: "Cart not Found"})
        }
          return res.status(200).json({ status: true, data: cart})
    } catch (err) {
          return res.status(400).send({ status: false, message: err.message })
    }
}

const emptyCart = async (req, res) => {
    const UserInfo = req.userId
    const userID = UserInfo._id;
     try {
        let cart = await cartRepository.cart(userID);
        cart.items = [];
        cart.subTotal = 0
        await cart.save();
        if(cart.items.length==0){
            let cart = await cartRepository.deleteCart(userID);
             return res.status(200).send({ status: true, message: "Cart empty successfully :)"  })
            }
    } catch (err) {
        console.log(err)
        return res.status(400).send({ status: false, message: err.message })
    }
}





module.exports = {addCart,updateQty,remProductCart,getCart,emptyCart}