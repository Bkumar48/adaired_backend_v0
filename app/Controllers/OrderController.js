'use strict';
const emailSend = require("../Helpers/emailIHelper")
const cartRepository = require('../Helpers/CartHelper')
const orderModel = require("../Models/OrderModel")
const CouponModel = require("../Models/CouponModel")
const path = require("path");
const ejs = require("ejs");
const {formatPhoneNumber} = require("../Helpers/validationHelper")
require('dotenv').config();
const footer = {facebook_link:process.env.twitter_link, 
                twitter_link :process.env.twitter_link, 
                pinterest_link:process.env.pinterest_link,
                instagram_link: process.env.instagram_link, 
                webUrl:process.env.WEB_URL, conatct:formatPhoneNumber(process.env.contact),
                appname:process.env.APP_NAME,
                currentYear: new Date().getFullYear()
              }
      
let axios = require("axios");
// const { Console } = require("console");
let hostUrl = process.env.hostUrl
let newAddressApi = process.env.newAddressApi
let apiKey = process.env.apiKey
let BLOCKONOMICS_XPUB = process.env.BLOCKONOMICS_XPUB
const priceAPi = process.env.priceApi
const currencyISO = process.env.currencyISO




// Order Summery

const orderSummery = async function(req, res){
    const UserInfo = req.userId
    const userID = UserInfo._id;
    let cart = await cartRepository.cart(userID);
    let cartSummery = []
    let userInfo = {name:cart.userId.firstName+" "+cart.userId.lastName, email:cart.userId.email};
    let amountPaid = cart.subTotal
    let discountedPrice = cart.discountedPrice
    let discountedAmount= ""
    let symbole =""
    if (cart) {
          cart.items.map( (item)=>{
            cartSummery.push({productTitle :item.productTile,
                              total :"$"+item.total
                             })
            })
      }
     
       // 1 for Percentage and 2 for Flat rate
       if(cart.couponDiscountType==1){
        const discountedPrice1 = (amountPaid*cart.couponDiscount)/100
        discountedAmount = Math.round(discountedPrice1*100)/100
        symbole = "%"
       }
       else{
        discountedAmount = cart.couponDiscount
        symbole = "FLat rate"
        }
        

      const couponSummery = {massage:"Coupon Discount",symbole:symbole, discountedAmount:"$"+discountedAmount, }
     return res.status(200).json({ status: true, cartSummery: cartSummery, amountPaid:"$"+amountPaid, discountedPrice:"$"+discountedPrice,couponSummery:couponSummery})
}

// apply Coupon code and Remove coupon code
const applyCoupon = async function(req, res){
    const UserInfo = req.userId
    const userID = UserInfo._id;
    let cart = await cartRepository.cart(userID);
    let amountPaid = cart.subTotal
    let remove = req.query.remove
    let discountedPrice =""
    //coupon
    const coupon = req.body.coupon
    let checkUser = ""
// Remove coupon code
    if(remove=="0"){
      const update = {couponId:"",coupon:"", couponDiscount:"", couponDiscountType:"", discountedPrice:""}
      let updateCouponCart = await cartRepository.unsetCouponCart(userID,update)
      return res.status(400).send({ status: false, massage: "Coupon has been removed!" })
     }
    //   Add Coupon code
    else{
    let CouponData = await CouponModel.findOne({code:coupon,expireStatus:true,deleted_at:null,status:true})
   
    // Check the coupon used user in time
      if(CouponData.copounUsedBy.length>=CouponData.copounUsed){
        checkUser = CouponData.copounUsedBy.includes(userID)
      }
      if(checkUser == true){
        return res.status(400).send({ status: false, massage: "You have not used coupon many time" })
      }
    let CouponCount = await CouponModel.findOne({code:coupon,expireStatus:true,deleted_at:null,status:true}).count()
    if(CouponCount>0){
    // 1 for Percentage and 2 for Flat rate
       if(CouponData.discountType==1){
        const discountedPrice1 = amountPaid-(amountPaid*CouponData.discount)/100
        discountedPrice = Math.round(discountedPrice1*100)/100
       }
       else{
        discountedPrice = amountPaid-CouponData.discount
        }
       const update = {couponId:CouponData._id,coupon:coupon, couponDiscount:CouponData.discount, couponDiscountType:CouponData.discountType, discountedPrice:discountedPrice}
       let updateCouponCart = await cartRepository.updateCouponCart(userID,update)
         //Order paid time
        // Update the counting of coupon after apply 
         await CouponModel.findOneAndUpdate({code:coupon},{$push:{copounUsedBy:userID}})
        return res.status(200).send({ status: true, massage:"Coupon has been applied successfully.", discountedPrice:discountedPrice,actualPrice:cart.subTotal})
     }
  } 
 
}









// Add to cart
 const createOrder = async function(req, res){
    try{
    const UserInfo = req.userId
    const userID = UserInfo._id;
    let cart = await cartRepository.cart(userID);
    let userInfo = {name:cart.userId.firstName+" "+cart.userId.lastName, email:cart.userId.email};
    let amountPaid = cart.subTotal
    const {pay_method, coupon} = req.body 
    // const {pay_method} = req.body 
    let payment_method ="";
    let queryOrder =""
    let userData = ""
    let amount  = (cart.discountedPrice)?cart.discountedPrice:cart.subTotal
    let couponDiscount =  "" 
    let couponDiscountType = ""
    let couponId =         ""
    let couponCode =       ""
    let discountedPrice =  ""
    
   

    // create order id
    let orderId ="";
    const checkOrder = await orderModel.find().count();     
    if(checkOrder==0){
      orderId =1000
    }
    else{
      orderId = checkOrder+1000
    }
          
    


   // const {firstName,lastName,email,mobile} = req.body
    // const billingData =  {
    //                                 firstName: firstName,
    //                                 lastName: lastName,
    //                                 email: email,
    //                                 mobile: mobile
    //                       }
  
//  bitcoin create order and payment
      if(pay_method==1){
        const blockonomicsParams = {};
          payment_method="bitcoin"
         

          // get bitcoin price in USD
          let configCoin = {
            method: 'GET',
            maxBodyLength: Infinity,
            url: hostUrl+priceAPi+currencyISO,
            headers: {
           'Authorization': 'Bearer '+apiKey
          }
      };
axios.request(configCoin)
.then(async (response) => {
  blockonomicsParams.bitcoinPrice =   Math.round(amount/response.data.price * Math.pow(10, 8)) / Math.pow(10, 8)
  // get bitcoin address to paid him
  const query_vars = '?match_account='+BLOCKONOMICS_XPUB;
  //const query_vars = '?reset=1&match_account='+BLOCKONOMICS_XPUB;
          let configAddress = {
            method: 'post',
            maxBodyLength: Infinity,
            url: hostUrl+newAddressApi+query_vars,
            headers: {
                 'Authorization': 'Bearer '+apiKey
            }
          };
          axios.request(configAddress)
          .then(async (response) => {
            blockonomicsParams.address = response.data.address;
            blockonomicsParams.orderId = orderId;
          // console.log(blockonomicsParams);

          
          couponCode = (cart.coupon)?cart.coupon:"";
          couponDiscountType = (cart.couponDiscountType)?cart.couponDiscountType:""; 
          couponDiscount = (cart.couponDiscount)?cart.couponDiscount:"";
          couponId = (cart.couponId?._id)?cart.couponId._id:''
          discountedPrice = (cart.discountedPrice)?cart.discountedPrice:"";
        //   queryOrder = {orderId:orderId,items:cart.items,payment_method:payment_method,couponCode:couponCode, couponDiscountType:couponDiscountType, couponDiscount:couponDiscount,couponId:couponId,
        //     discountedPrice:discountedPrice,amount:amount,actualPrice:cart.subTotal,userId:userID};
        
        couponId = cart.couponId?._id || null; // Use null or a default value if cart.couponId is not available.
        // ...
        queryOrder = {
        orderId: orderId,
        items: cart.items,
        payment_method: payment_method,
        couponCode: couponCode,
        couponDiscountType: couponDiscountType,
        couponDiscount: couponDiscount,
        couponId: couponId, // Use the computed value for couponId here.
        discountedPrice: discountedPrice,
        amount: amount,
        actualPrice: cart.subTotal,
        userId: userID
        };
           
          // queryOrder = {orderId:orderId,items:cart.items,payment_method:payment_method,amount:amount,
          //   couponDiscountType:couponDiscountType, couponDiscount:couponDiscount,couponId:couponId,couponCode:couponCode,
          //    discountedPrice:discountedPrice,actualPrice:cart.subTotal,userId:userID};  
           const orders = await orderModel.create(queryOrder);
        if(orders){
          await orderModel.findOneAndUpdate({orderId:orderId},{$set:{bitcoinAddress:blockonomicsParams.address,bitcoinAmount:blockonomicsParams.bitcoinPrice,amount:cart.subTotal}})
          let payment_status ="unpaid"
          const bit_pay_url= `${process.env.BASE_URL}:${process.env.NODE_PORT}/api/v1/order/paymentBitcoin/?orderId=${orderId}`;
          const razor_pay_url= 'https://adaired.com/ac/payments/?orderno='+orderId;
          const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
          // const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
          // const emailData = {name: userInfo.name, email:userInfo.email, orderTitle:"Order Create",items:cart.items, orderstatus:"pending", coupon:coupon, 
          // amount:amountPaid, payment_status:payment_status,payment_method:payment_method, orderId:orderId,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url, logo:logoPath,footer:footer} 
        
          const emailData = {name: userInfo.name, email:userInfo.email, orderTitle:"Order Create",items:cart.items, orderstatus:"pending", 
          amount:amount,  couponDiscountType:couponDiscountType, couponDiscount:couponDiscount,couponId:couponId,couponCode:couponCode,
          discountedPrice:discountedPrice,actualPrice:cart.subTotal, 
          payment_status:payment_status,payment_method:payment_method, orderId:orderId,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url,footer:footer} 
          const Subject = "Order Create"
          const data = await ejs.renderFile(templatePath, emailData );
          res.end(data);
         // let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
        //  return res.status(200).send({ status: true, massage:"Your order is created successfuly",userData:blockonomicsParams})
          }
          })
          .catch((error) => {
             return res.status(400).send({ status: false, message: error.message })
          });
      })
      .catch((error) => {
       return res.status(400).send({ status: false, message: error.message })
     });
  }
        if(pay_method==2){
           payment_method="razorpay"
           const bit_pay_url= `${process.env.BASE_URL}:${process.env.NODE_PORT}/api/v1/order/paymentBitcoin/?orderId=${orderId}`;
           const razor_pay_url= 'https://adaired.com/ac/payments/?orderno='+orderId;
           
            couponCode = (cart.coupon)?cart.coupon:"";
            couponDiscountType = (cart.couponDiscountType)?cart.couponDiscountType:""; 
            couponDiscount = (cart.couponDiscount)?cart.couponDiscount:"";
            couponId = (cart.couponId?._id)?cart.couponId._id:''
            discountedPrice = (cart.discountedPrice)?cart.discountedPrice:"";
           
            // queryOrder = {orderId:orderId,items:cart.items,payment_method:payment_method,couponCode:couponCode, couponDiscountType:couponDiscountType, couponDiscount:couponDiscount,couponId:couponId,
            // discountedPrice:discountedPrice,amount:amount,actualPrice:cart.subTotal, pay_url:razor_pay_url,userId:userID};
            couponId = cart.couponId?._id || null; // Use null or a default value if cart.couponId is not available.
        // ...
        queryOrder = {
        orderId: orderId,
        items: cart.items,
        payment_method: payment_method,
        couponCode: couponCode,
        couponDiscountType: couponDiscountType,
        couponDiscount: couponDiscount,
        couponId: couponId, // Use the computed value for couponId here.
        discountedPrice: discountedPrice,
        amount: amount,
        actualPrice: cart.subTotal,
        userId: userID
        };
     
           userData = {razor_pay_url:razor_pay_url }
           const orders = await orderModel.create(queryOrder);
            if(orders){
            let payment_status ="unpaid"
          const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
          const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
          const emailData = {name: userInfo.name, email:userInfo.email, orderTitle:"Order Create",items:cart.items, orderstatus:"pending", 
          amount:amount,  couponDiscountType:couponDiscountType, couponDiscount:couponDiscount,couponId:couponId,couponCode:couponCode,
          discountedPrice:discountedPrice,actualPrice:cart.subTotal, 
          payment_status:payment_status,payment_method:payment_method, orderId:orderId,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url,footer:footer} 
         
          const data = await ejs.renderFile(templatePath, emailData );
          res.end(data);
          const Subject = "Order Create"
        //   let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
        return res.status(200).send({ status: true, massage:"Your order is created  successfuly",userData:userData})
        }
      }
    }
     catch (err){
         return res.status(400).send({ status: false, message: err.message })
       }
  }
 

   const getOrder =  async function (req, res){
    try{
    // const UserInfo = req.userId
    // const userID = UserInfo._id;
    const orderId = req.query.orderId
    const orders = await orderModel.findOne({orderId:orderId,orderstatus:'pending',payment_status:'unpaid',deleted_at:null });
    if(orders){
        return res.status(200).send({ status: true, data:orders})
    }
     else{
        return res.status(400).send({ status: false, message: "Order id is not exist" })
     }   
    }
    catch (err){
        return res.status(400).send({ status: false, message: err.message })
    }
   } 

   // verify the bitcoin payment
  const varifyBitcoinpay =  async function(req, res){

  let BLOCKONOMICS_SECRET = process.env.BLOCKONOMICS_SECRET
  const value = (req.query.value/0.1e9)
  const addr = (req.query.addr)
  const txid = req.query.txid
  let orderDetail = await orderModel.findOne({bitcoinAddress:addr}).populate('userId',{ firstName: 1, lastName: 1, email:1})
  let userInfo = {name:orderDetail.userId.firstName+" "+orderDetail.userId.lastName, email:orderDetail.userId.email}; 
  const amountPaid = orderDetail.bitcoinAmount;
  const userID = orderDetail.userId
  let items =  orderDetail.items; 
  let orderInfo =""
    if(req.query.secret!=BLOCKONOMICS_SECRET){
      return res.status(400).send({ status: false, message: "Secret key is not match" })
    }
    if(Number(req.query.status)==0){
        await orderModel.findOneAndUpdate({bitcoinAddress:addr},{$set:{orderstatus:"failed",payment_status:'unpaid',bitcoinAmountReceive:value,txid:txid}})
          orderInfo = {   
                                         orderTitle:"Order Failure",
                                         orderstatus:"failed",
                                         payment_status:"unpaid",
                                         amount:orderDetail.amount,
                                         coupon:orderDetail.couponCode,
                                        couponDiscountType:orderDetail.couponDiscountType,
                                        couponDiscount:orderDetail.couponDiscount,
                                        discountedPrice:orderDetail.discountedPrice,
                                        actualPrice:orderDetail.actualPrice,
                                         payment_method:orderDetail.payment_method
                                       };
                                       
                                   
        
        const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
        const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`  
        const bit_pay_url= `${process.env.BASE_URL}:${process.env.NODE_PORT}/api/v1/order/paymentBitcoin/?orderId=${orderDetail.orderId}`;
        const razor_pay_url= 'https://adaired.com/ac/payments/?orderno='+orderDetail.BLOCKONOMICS_XPUBorderId;
        const emailData = { orderId:orderDetail.orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  
          amount:orderInfo.amount, orderstatus:orderInfo.orderstatus, payment_status:orderInfo.payment_status,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url,coupon:orderInfo.coupon,
          couponDiscountType:orderInfo.couponDiscountType, couponDiscount:orderInfo.couponDiscount,discountedPrice:orderInfo.discountedPrice,
          actualPrice:orderInfo.actualPrice,payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
         const data = await ejs.renderFile(templatePath, emailData );
          //res.end(data);
        const Subject = "Order Failure"
     //   let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
        let cart = await cartRepository.cart(userID);
             if(cart!=undefined){
               let cart = await cartRepository.deleteCart(userID);
             }
      return res.status(400).send({ status: false, message: "Payment is failed" })
    }
    // if(Number(req.query.status)!=2){
    //   return res.status(400).send({ status: false, message: "Payment is not done" })
    // }
   
     if(amountPaid==value){
        await orderModel.findOneAndUpdate({bitcoinAddress:addr},{$set:{orderstatus:"completed",payment_status:'paid',bitcoinAmountReceive:value,txid:txid}})
                  orderInfo = {   
                                           orderTitle:"Order Paid",
                                           orderstatus:"completed",
                                           payment_status:"paid",
                                           amount:orderDetail.amount,
                                           coupon:orderDetail.couponCode,
                                           couponDiscountType:orderDetail.couponDiscountType,
                                           couponDiscount:orderDetail.couponDiscount,
                                           discountedPrice:orderDetail.discountedPrice,
                                           actualPrice:orderDetail.actualPrice,
                                           payment_method:orderDetail.payment_method
                                         };
                  
      
                                     
       
        const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
       const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
      
        const emailData = { orderId:orderDetail.orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  
          amount:orderInfo.amount, orderstatus:orderInfo.orderstatus, payment_status:orderInfo.payment_status,coupon:orderInfo.coupon,
          couponDiscountType:orderInfo.couponDiscountType, couponDiscount:orderInfo.couponDiscount,discountedPrice:orderInfo.discountedPrice,
          actualPrice:orderInfo.actualPrice,payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
         const data = await ejs.renderFile(templatePath, emailData );
      //      res.end(data);
         const Subject = "Order Paid"
        //let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
        let cart = await cartRepository.cart(userID);
           if(cart!=undefined){
             let cart = await cartRepository.deleteCart(userID);
           }
         return res.status(200).send({ status: true, message:"Payment is done successfuly"})
     }
    else{
      await orderModel.findOneAndUpdate({bitcoinAddress:addr},{$set:{orderstatus:"pending",payment_status:'unconfirmed',bitcoinAmountReceive:value,txid:txid}})
   
        orderInfo = {   
                                       orderTitle:"Order Unconfirmed",
                                       orderstatus:"pending",
                                       payment_status:"unconfirmed",
                                       amount:orderDetail.amount,
                                       coupon:orderDetail.couponCode,
                                       couponDiscountType:orderDetail.couponDiscountType,
                                       couponDiscount:orderDetail.couponDiscount,
                                       discountedPrice:orderDetail.discountedPrice,
                                       actualPrice:orderDetail.actualPrice,
                                       payment_method:orderDetail.payment_method
                                     };
                  
                                     
      
      const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
      const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`  
      const bit_pay_url= `${process.env.BASE_URL}:${process.env.NODE_PORT}/api/v1/order/paymentBitcoin/?orderId=${orderDetail.orderId}`;
      const razor_pay_url= 'https://adaired.com/ac/payments/?orderno='+orderDetail.BLOCKONOMICS_XPUBorderId;
     
        const emailData = { orderId:orderDetail.orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  
          amount:orderInfo.amount, orderstatus:orderInfo.orderstatus, payment_status:orderInfo.payment_status,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url,coupon:orderInfo.coupon,
          couponDiscountType:orderInfo.couponDiscountType, couponDiscount:orderInfo.couponDiscount,discountedPrice:orderInfo.discountedPrice,
          actualPrice:orderInfo.actualPrice,payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
         const data = await ejs.renderFile(templatePath, emailData );
        //    res.end(data);

       
      const Subject = "Order Unconfirmed"
     // let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
      let cart = await cartRepository.cart(userID);
           if(cart!=undefined){
             let cart = await cartRepository.deleteCart(userID);
           }
         return res.status(400).send({ status: false, message: "Payment is not match" })
     }
}

// verify the razopay 
const verifyRazopay = async function(req, res){
    try{
      const orderId = req.query.orderId
      const status = req.query.status
       let orderInfo =""
      const orderDetail = await orderModel.findOne({orderId:orderId}).populate('userId',{ firstName: 1, lastName: 1, email:1})
     
        let userInfo = {name:orderDetail.userId.firstName+" "+orderDetail.userId.lastName, email:orderDetail.userId.email}; 
       let userID = orderDetail.userId
     if(orderDetail && status==1){
        await orderModel.findOneAndUpdate({orderId:orderId},{$set:{orderstatus:"completed",payment_status:'paid'}})
         userID = orderDetail.userId
                              orderInfo = {   
                                           orderTitle:"Order Paid",
                                           orderstatus:"completed",
                                           payment_status:"paid",
                                           amount:orderDetail.amount,
                                           coupon:orderDetail.couponCode,
                                           couponDiscountType:orderDetail.couponDiscountType,
                                           couponDiscount:orderDetail.couponDiscount,
                                           discountedPrice:orderDetail.discountedPrice,
                                           actualPrice:orderDetail.actualPrice,
                                           payment_method:orderDetail.payment_method
                               };
       const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
       const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
      const emailData = { orderId:orderDetail.orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  
                          amount:orderInfo.amount, orderstatus:orderInfo.orderstatus, payment_status:orderInfo.payment_status,coupon:orderInfo.coupon,
                          couponDiscountType:orderInfo.couponDiscountType, couponDiscount:orderInfo.couponDiscount,discountedPrice:orderInfo.discountedPrice,
                          actualPrice:orderInfo.actualPrice,payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
             const data = await ejs.renderFile(templatePath, emailData );
      //   res.end(data);
           const Subject = "Order Paid"
            //let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
          // remove cart 
           let cart = await cartRepository.cart(userID);
               if(cart!=undefined){
                 let cart = await cartRepository.deleteCart(userID);
             }
              return res.status(200).send({ status: true, message:"Payment is done successfuly"})
       }
      
    if(orderDetail && status==2){
      await orderModel.findOneAndUpdate({orderId:orderId},{$set:{orderstatus:"cancelled",payment_status:'unpaid'}})
      userID = orderDetail.userId
         
        orderInfo = {   
          orderTitle:"Order Cancel",
          orderstatus:"cancelled",
          payment_status:"unpaid",
          amount:orderDetail.amount,
          coupon:orderDetail.couponCode,
          couponDiscountType:orderDetail.couponDiscountType,
          couponDiscount:orderDetail.couponDiscount,
          discountedPrice:orderDetail.discountedPrice,
          actualPrice:orderDetail.actualPrice,
          payment_method:orderDetail.payment_method
};

          const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
          const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
          const emailData = { orderId:orderDetail.orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  
            amount:orderInfo.amount, orderstatus:orderInfo.orderstatus, payment_status:orderInfo.payment_status,coupon:orderInfo.coupon,
            couponDiscountType:orderInfo.couponDiscountType, couponDiscount:orderInfo.couponDiscount,discountedPrice:orderInfo.discountedPrice,
            actualPrice:orderInfo.actualPrice,payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
          const data = await ejs.renderFile(templatePath, emailData );
///res.end(data);
          const Subject = "Order Cancel"
        //  let mailtest = await emailSend.emailSend("vijay@adaired.com",Subject,data);   
       // remove cart
          let cart = await cartRepository.cart(userID);
          if(cart!=undefined){
            await cartRepository.deleteCart(userID);
          }
        return res.status(400).send({ status: false, message: "Payment is cancel" })
    }
    else{
      return res.status(400).send({ status: false, message: "Order is not exist" })
    }
    }
    catch (err){
      return res.status(400).send({ status: false, message: err.message })
  }
}

// bitcoin payment after cancle order

const paymentBitcoin = async function(req,res){
  const orderId = req.query.orderId
  let orderInfo =""
  const orderDetail = await orderModel.findOne({orderId:orderId}).populate('userId',{ firstName: 1, lastName: 1, email:1})
  let userInfo = {name:orderDetail.userId.firstName+" "+orderDetail.userId.lastName, email:orderDetail.userId.email};
  const blockonomicsParams = {};
  let payment_method="bitcoin"
         
              // get bitcoin price in USD
              let configCoin = {
                method: 'GET',
                maxBodyLength: Infinity,
                url: hostUrl+priceAPi+currencyISO,
                headers: {
              'Authorization': 'Bearer '+apiKey
              }
          };
axios.request(configCoin)
.then(async (response) => {
  blockonomicsParams.bitcoinPrice =   Math.round(orderDetail.amount/response.data.price * Math.pow(10, 8)) / Math.pow(10, 8)
  // get bitcoin address to paid him
  const query_vars = '?match_account='+BLOCKONOMICS_XPUB;
           let configAddress = {
            method: 'post',
            maxBodyLength: Infinity,
            url: hostUrl+newAddressApi+query_vars,
            headers: {
                 'Authorization': 'Bearer '+apiKey
            }
          };
          axios.request(configAddress)
          .then(async (response) => {
            blockonomicsParams.address = response.data.address;
            blockonomicsParams.orderId = orderId;
          // console.log(blockonomicsParams);
           await orderModel.findOneAndUpdate({orderId:orderId},{$set:{bitcoinAddress:blockonomicsParams.address,bitcoinAmount:blockonomicsParams.bitcoinPrice,amount:orderDetail.amount,payment_method:payment_method,pay_url:""}})
           
                       orderInfo = {   
                                  orderTitle:"Order Create",
                                  orderstatus:"pending",
                                  payment_status:"unpaid",
                                  amount:orderDetail.amount,
                                  coupon:orderDetail.coupon,
                                  payment_method:orderDetail.payment_method
                       };


           const bit_pay_url= `${process.env.BASE_URL}:${process.env.NODE_PORT}/api/v1/order/paymentBitcoin/?orderId=${orderId}`;
           const razor_pay_url= 'https://adaired.com/ac/payments/?orderno='+orderId;
           const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
           const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
           const emailData = { orderId:orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  amount:orderInfo.amount, 
            orderstatus:orderInfo.orderstatus,coupon:orderInfo.coupon,payment_status:orderInfo.payment_status, payment_method:orderInfo.payment_method,bit_pay_url:bit_pay_url,razor_pay_url:razor_pay_url,logo:logoPath,footer:footer} 
           const data = await ejs.renderFile(templatePath, emailData );
           const Subject = "Order Create"
          // let mailtest = await emailSend.emailSend(userInfo.email,Subject,data);
          return res.status(200).send({ status: true, massage:"Your order is created successfuly",userData:blockonomicsParams})
             })
          .catch((error) => {
             return res.status(400).send({ status: false, message: error.message })
          });
      })
  .catch((error) => {
    return res.status(400).send({ status: false, message: error.message })
  });


}



 
const emailTest = async function(req, res){
  const orderId = "1001"
  const orderDetail = await orderModel.findOne({orderId:orderId}).populate('userId',{ firstName: 1, lastName: 1, email:1})
 
  let items =  orderDetail.items;
  let userInfo = {name:orderDetail.userId.firstName+" "+orderDetail.userId.lastName, email:orderDetail.userId.email};
  let orderInfo ="";
  if(orderDetail.payment_method=="razorpay" && orderDetail.orderstatus=="completed"){
      orderInfo = { 
                    orderTitle:"Order Paid",
                    amount:orderDetail.amount,
                    orderstatus:orderDetail.orderstatus,
                    coupon:orderDetail.coupon,
                    payment_status:orderDetail.payment_status,
                    payment_method:orderDetail.payment_method
                };
  }
  if(orderDetail.payment_method=="bitcoin" && orderDetail.orderstatus=="completed"){
   orderInfo = {    bitcoinsReceiv:orderDetail.bitcoinAmountReceive,
                    bitcoinsAmount:orderDetail.bitcoinAmount,
                    txid:orderDetail.txid, 
                    bitcoinAddress:orderDetail.bitcoinAddress,
                    orderTitle:"Order Paid",
                    amount:orderDetail.amount,
                    orderstatus:orderDetail.orderstatus,
                    coupon:orderDetail.coupon,
                    payment_status:orderDetail.payment_status,
                    payment_method:orderDetail.payment_method
                  };
                }
             const templatePath = path.join(__dirname, "../../views/orderTeple.ejs.html")        
             const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`   
             const emailData = { orderId:orderId,name:userInfo.name, email:userInfo.email,items:orderDetail.items,orderTitle:orderInfo.orderTitle,  amount:orderInfo.amount, 
                                  orderstatus:orderInfo.orderstatus,coupon:orderInfo.coupon,payment_status:orderInfo.payment_status,
                                  payment_method:orderInfo.payment_method , logo:logoPath,footer:footer} 
             const data = await ejs.renderFile(templatePath, emailData );
             let mailtest = await emailSend.emailSend(userInfo.email,"test",data);
            res.end(data);
        
  //console.log(mailtest);
} 
 
 



module.exports = {orderSummery,applyCoupon, createOrder, getOrder, varifyBitcoinpay,verifyRazopay,paymentBitcoin,emailTest}