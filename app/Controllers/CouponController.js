const Coupon = require("../Models/CouponModel");
const asyncHandler = require("express-async-handler");
const {coupnCode,digits,dateFormat} = require("../Helpers/validationHelper")
const cron = require('node-cron');
// Create a new Coupon
const createCoupon = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const {code, discount, discountType, expire,copounUsed }= req.body

        
        if(!code){
          return res.status(400).send({ status: false, massage: "Coupon code is required!" })
        }
        // else if((code).indexOf("#")!=0){
        //   return res.status(400).send({ status: false, massage: "Coupon code's first latter is hash (#) " })
        // }
        // else if((code).length!=9){
        //   return res.status(400).send({ status: false, massage: "Coupon code lenght is 9 required" })
        // }
        else if(coupnCode(code)==false){
          return res.status(400).send({ status: false, massage: "Coupon code is required 4 Capital Latters, 4 Digists and One Hash (#) Symbol" })
        }
        
        if(!discount){
          return res.status(400).send({ status: false, massage: "Discount is required!" })
        }
      
        else if((discount).length>3){
          return res.status(400).send({ status: false, massage: "Discount is in digits in maximum two digits" })
        }
        
        else if(digits(discount)== false){
           return res.status(400).send({ status: false, massage: "Discount is in digits" })
         }

         if(!discountType){
          return res.status(400).send({ status: false, massage: "Discount type is required!" })
         }
        
         if(!expire){
          return res.status(400).send({ status: false, massage: "Coupon expire date is required!" })
         }

         if(dateFormat(expire)==false){
          return res.status(400).send({ status: false, massage: "Date format is required (dd-mm-yyyy)!" })
         }
         
         else if((expire).length>10){
          return res.status(400).send({ status: false, massage: "Invalid date" })
        }

        if(!copounUsed){
          return res.status(400).send({ status: false, massage: "Coupon used is required!" })
        }
      
          else if(digits(copounUsed)== false){
           return res.status(400).send({ status: false, massage: "Coupon used is in digits" })
         }
        
         const couponCode = await Coupon.find({code:code}).count();
         if(couponCode>0){
          return res.status(400).send({ status: false, massage: "Coupon already exist in list" })
         }

        const query = { code: code, discount: discount, discountType:discountType, status: true, expire: expire,copounUsed:copounUsed }
     
        await Coupon.create(query);
        return res.status(200).send({ status: true, massage: "Coupon create successfully! :)" })
   }
  else{
    return res.status(400).send({ status: false, massage: "Access deny create blog !" })
  } 
  } catch (error) {
    console.log(error);
    return res.status(400).send({ status: false, massage: error.message })
  }
});

// Get all Coupons
const getAllCoupons = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const limitValue = parseInt(req.query.limit || 10);
        const skipValue = parseInt(req.query.skip || 0);
        const expiryStatus = parseInt(req.query.expiryStatus || 0);
        const coupon =   req.query.coupon 
        const status = parseInt(req.query.status || 0) 
        let query = ""
        
        if(expiryStatus){
           const status = expiryStatus==1?true:false
            query =  {expireStatus:status} 
        }
        else if(coupon){
           query=  {code:coupon} 
         }
      else  if(status){
        const state = status==1?true:false
        query=  {status:state} 
       }
       else{
          query=  {deleted_at:null}
       }
      
        const couponData = await Coupon.find(query).limit(limitValue).skip(skipValue).sort({createdAt: -1}).populate('copounUsedBy',{ firstName: 1, lastName: 1, email:1});
        const countCoupon = await Coupon.find(query).count();
        if(countCoupon>0){
          return res.status(200).send({ status: true,  countCoupon:countCoupon, data:couponData})
        }
        else{
          return res.status(400).send({ status: false, message: "No Order in the list"})
        }
  }
  else{
    return res.status(400).send({ status: false, massage: "Access deny create blog !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, massage: error.message })
  }
});

// Get one Coupon
const getOneCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.query;
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
       const coupon = await Coupon.findById(couponId);
       return res.status(200).send({ status: true,  data:coupon})
  }
  else{
    return res.status(400).send({ status: false, massage: "Access deny create blog !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, massage: error.message })
  }
});



const changeStatus = async function(req, res){

  const { couponId } = req.query;
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
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
        const coupon = await Coupon.findOneAndUpdate({_id:couponId}, {$set:{status:status}});
       return res.status(200).send({ status: true,  massage: "Status update successfuly!"})
  }
  else{
    return res.status(400).send({ status: false, massage: "Access deny create coupon !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, massage: error.message })
  }



}


// Update a coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.query;
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){

        const {code, discount, discountType, expire,copounUsed }= req.body
        if(!code){
          return res.status(400).send({ status: false, massage: "Coupon code is required!" })
        }
        // else if((code).indexOf("#")!=0){
        //   return res.status(400).send({ status: false, massage: "Coupon code's first latter is hash (#) " })
        // }
        // else if((code).length!=9){
        //   return res.status(400).send({ status: false, massage: "Coupon code lenght is 9 required" })
        // }
        else if(coupnCode(code)==false){
          return res.status(400).send({ status: false, massage: "Coupon code is required 4 Capital Latters, 4 Digists and One Hash (#) Symbol" })
        }
        
        if(!discount){
          return res.status(400).send({ status: false, massage: "Discount is required!" })
        }
      
        else if((discount).length>3){
          return res.status(400).send({ status: false, massage: "Discount is in digits in maximum two digits" })
        }
        
        else if(digits(discount)== false){
           return res.status(400).send({ status: false, massage: "Discount is in digits" })
         }

         if(!discountType){
          return res.status(400).send({ status: false, massage: "Discount type is required!" })
         }
        
         if(!expire){
          return res.status(400).send({ status: false, massage: "Coupon expire date is required!" })
         }

         if(dateFormat(expire)==false){
          return res.status(400).send({ status: false, massage: "Date format is required (dd-mm-yyyy)!" })
         }
         
         else if((expire).length>10){
          return res.status(400).send({ status: false, massage: "Invalid date" })
        }

        if(!copounUsed){
          return res.status(400).send({ status: false, massage: "Coupon used is required!" })
        }
      
          else if(digits(copounUsed)== false){
           return res.status(400).send({ status: false, massage: "Coupon used is in digits" })
         }
        
         const couponCode = await Coupon.find({code:code}).where({ "_id": { "$ne": couponId }}).count();
         if(couponCode>0){
          return res.status(400).send({ status: false, massage: "Coupon already exist in list" })
         }
        const query = { code: code, discount: discount, discountType: discountType, status: true, expire: expire,copounUsed:copounUsed }
        await Coupon.findByIdAndUpdate(couponId, {$set:query});
        return res.status(200).send({ status: true,  massage: "Coupon update successfuly!"})
       }
     else{
      return res.status(400).send({ status: false, massage: "Access deny update Coupon !" })
   } 
   } catch (error) {
    return res.status(400).send({ status: false, massage: error.message })
  }
});

// Expire Coupon with cron
const couponExpire =  async (req, res)=>{
  let date_time = new Date();
  let date = ("0" + date_time.getDate()).slice(-2);
  // get current month
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  // get current year
  let year = date_time.getFullYear();
  let todayDate = date + "-" + month + "-" + year
  cron.schedule('* * * * *', async () => {
    const dataList = await Coupon.updateMany({expire:todayDate},{$set:{expireStatus:false}})
    // console.log(dataList);
    // console.log('running a task every minute');
});

}



// Delete a coupon
const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.query;
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].coupon.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const now = new Date();
        const year = now.getFullYear();
        const month = ("0" + (now.getMonth() + 1)).slice(-2);
        const day = ("0" + now.getDate()).slice(-2);
        const hour = ("0" + now.getHours()).slice(-2);
        const minute = ("0" + now.getMinutes()).slice(-2);
        const second = ("0" + now.getSeconds()).slice(-2);
        // YYYY-MM-DD hh:mm:ss
        const formatted = `${year}-${month}-${day} ${hour}:${minute}:${second}`;


    const deletedCoupon = await Coupon.findByIdAndUpdate(couponId,{$set:{deleted_at:formatted}});
    return res.status(200).send({ status: true,  massage: "Coupon delete successfuly!"})
  }

  else{
    return res.status(400).send({ status: false, massage: "Access deny delete Coupon !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, massage: error.message })
  }
  
});

module.exports = { createCoupon, getAllCoupons, getOneCoupon, changeStatus, updateCoupon, couponExpire, deleteCoupon };
