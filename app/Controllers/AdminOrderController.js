'use strict';
const orderModel = require("../Models/OrderModel")
const userModel = require("../Models/UserModel")
const {utcDate} = require("../Helpers/DateHelper");
const {validateEmail} = require("../Helpers/validationHelper")
const excel = require("exceljs");
require('dotenv').config();
// all order in user panel
const getAllOrders = async function(req, res){

    let getList="" ;
    let permissions =""
    const UserInfo = req.userId
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].orders.read== true
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
         const payment_status = parseInt(req.query.payment_status || 0);
         const startDate = req.query.startDate 
         const endtDate =  req.query.endtDate 
         const orderNo =   parseInt(req.query.orderno || 0)
         const userMail =  req.query.userMail   
         const order_status = parseInt(req.query.order_status || 0)
         const payment_method = parseInt(req.query.payment_method || 0) 
         let query = ""
         
         // Pending Order
         if(payment_status==1){
          query=  {payment_status:"Unpaid", orderstatus:"pending",deleted_at:null}
          console.log(query);
        }
        
        // Paid Order
         else if(payment_status==2){
            query=  {payment_status:"paid", orderstatus:"completed",deleted_at:null}
        }

        // Search by date
       else if(startDate!="" && endtDate!="" ){
           const startDate = utcDate(req.query.startDate,1) // start date for 1
           const endtDate =  utcDate(req.query.endtDate,2) // end  date for 2
           query=  {createdAt:{$gte:startDate,$lte:endtDate },deleted_at:null}
        }

       // Search by Order number 
        else if(orderNo!=""){
            query=  {orderId:orderNo,deleted_at:null} 
        }

        // Search by user email number
        else if(userMail!=""){
            if(validateEmail(req.query.userMail)==false){
                return res.status(400).send({ status: false, message: "Please enter valid email"})
            }
            else{
             const userId =  await userModel.findOne({email:userMail});
             query=  {userId:userId._id,deleted_at:null}
            }
        }
      
      // Search by Order Status
       // orderstatus
        else if(order_status!=""){
            const status = [{key:1,value:'pending'}, {key:2, value:'completed'}, {key:3, value:'hold'},  {key:4, value:'cancelled'},
                        {key:5,value:'processing'},{key:6, value:'refund'},{key:7,value:'failed'}, {key:8, value:'fraud'},{key:9, value:'Active'}]
            status.filter((item, index, array) => {
                    if(item.key==order_status){
                        query=  {orderstatus:item.value,deleted_at:null}
                      }
             })
        }
      
      // Search by payment method
        else if (payment_method!=""){
            const payment = [{key:1, value:"bitcoin"},{key:2, value:"razorpay"}]
            payment.filter((item,index,data) =>{
                    if(item.key==payment_method){
                        query = {payment_method:item.value,deleted_at:null}
                     }
            })
        }


        // All Data show in the list
        else{
               query=  {deleted_at:null}
           }
           // console.log(query);   
         const orderData = await orderModel.find(query).limit(limitValue).skip(skipValue).sort({createdAt: -1}).populate('userId',{ firstName: 1, lastName: 1, email:1});
         const countOrder = await orderModel.find(query).count();
         if(countOrder>0){
            return res.status(200).send({ status: true,  countOrder:countOrder, data:orderData})
          }
          else{
            return res.status(400).send({ status: false, message: "No Order in the list"})
          }
        }
        return res.status(400).send({ status: false, message: "Access deny!" })
        }
        catch (err) {
            return res.status(400).send({ status: false, message: err.message })
         }
 }

// Get Single order
const singleOrder = async function(req, res){
  let getList="" ;
  let permissions =""
  const UserInfo = req.userId
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].orders.read== true
  }
  
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
       const orderId = req.query.orderId
       const query=  {orderId:orderId, deleted_at:null}
       const orderData = await orderModel.find(query);
       const countOrder = await orderModel.find(query).count();
       if(countOrder>0){
          return res.status(200).send({ status: true, data:orderData})
        }
        else{
          return res.status(400).send({ status: false, message: "No Order in the list"})
        }
      }
    }
      catch (err) {
          return res.status(400).send({ status: false, message: err.message })
       }
     
}

// Delete Order
const deleteOrder = async function(req, res){
  let getList="" ;
    let permissions =""
    const UserInfo = req.userId
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].orders.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
          const orderId = req.query.orderId
          const orderData = await orderModel.findOne({orderId:orderId});
          if(orderData.deleted_at==null){
            const date = new Date()
             const data =  await orderModel.findOneAndUpdate({orderId:orderId}, {$set:{deleted_at:date}});
              return res.status(200).send({ status: true, message: "Order deleted successfuly"})
          }
           if(orderData.deleted_at!=null){
              await orderModel.updateOne({orderId:orderId}, {$set:{deleted_at:null}});
              return res.status(200).send({ status: true, message: "Order recovered successfuly"})
           }
        }
    }  
    catch (err) {
      return res.status(400).send({ status: false, message: err.message })
   }
}


const getDeletedOrders = async function(req, res){

  let getList="" ;
  let permissions =""
  const UserInfo = req.userId
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].orders.read== true
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
       const startDate = req.query.startDate 
       const endtDate =  req.query.endtDate 
       const orderNo =   parseInt(req.query.orderno || 0)
       const userMail =  req.query.userMail   
       let query = ""
       
    
      // Search by date
      if(startDate!="" && endtDate!="" ){
         const startDate = utcDate(req.query.startDate,1) // start date for 1
         const endtDate =  utcDate(req.query.endtDate,2) // end  date for 2
         query=  {createdAt:{$gte:startDate,$lte:endtDate },deleted_at:{$nin:null}}
      }

     // Search by Order number 
      else if(orderNo!=""){
          query=  {orderId:orderNo,deleted_at:{$nin:null}} 
      }

      // Search by user email number
      else if(userMail!=""){
          if(validateEmail(req.query.userMail)==false){
              return res.status(400).send({ status: false, message: "Please enter valid email"})
          }
          else{
           const userId =  await userModel.findOne({email:userMail});
           query=  {userId:userId._id,deleted_at:{$nin:null}}
          }
      }
    
      // All Data show in the list
      else{
             query=  {deleted_at:{$nin:null}}
         }
         // console.log(query);   
       const orderData = await orderModel.find(query).limit(limitValue).skip(skipValue).sort({createdAt: -1}).populate('userId',{ firstName: 1, lastName: 1, email:1});
       const countOrder = await orderModel.find(query).count();
       if(countOrder>0){
          return res.status(200).send({ status: true,  countOrder:countOrder, data:orderData})
        }
        else{
          return res.status(400).send({ status: false, message: "No Order in the list"})
        }
      }
      return res.status(400).send({ status: false, message: "Access deny!" })
      }
      catch (err) {
          return res.status(400).send({ status: false, message: err.message })
       }
}








 // Get Invoice 
 const getInvoice =  async function(req, res){
    let getList="" ;
    const UserInfo = req.userId
     try {
         if(UserInfo.roleType=="admin"){
           getList= true
         }
         const orderId = req.query.orderId
         const query=  {userId:UserInfo._id, orderId:orderId, orderstatus:"completed",payment_status:"paid",deleted_at:null}
         const orderData = await orderModel.find(query);
         const countOrder = await orderModel.find(query).count();
         if(countOrder>0){
            return res.status(200).send({ status: true, data:orderData})
          }
          else{
            return res.status(400).send({ status: false, message: "No Order in the list"})
          }
        }
        catch (err) {
            return res.status(400).send({ status: false, message: err.message })
         }
    }


// Generate the report
const dwonloadReport = async function(req, res){
  const payment_status = parseInt(req.query.payment_status || 0);
  const startDate = (req.query.startDate|| 0) 
  const endtDate =  (req.query.endtDate || 0)
  const orderNo =   parseInt(req.query.orderno || 0)
  const userMail =  req.query.userMail   
  const order_status = parseInt(req.query.order_status || 0)
  const payment_method = parseInt(req.query.payment_method || 0) 
  let query = ""
  // Pending Order
  if(payment_status==1){
    query=  {payment_status:"Unpaid", orderstatus:"pending",deleted_at:null}
    console.log(query);
  }
  
  // Paid Order
   else if(payment_status==2){
      query=  {payment_status:"paid", orderstatus:"completed",deleted_at:null}
  }

  // Search by date
 else if(startDate!="" && endtDate!="" ){
     const startDate = utcDate(req.query.startDate,1) // start date for 1
     const endtDate =  utcDate(req.query.endtDate,2) // end  date for 2
     query=  {createdAt:{$gte:startDate,$lte:endtDate },deleted_at:null}
  }

 // Search by Order number 
  else if(orderNo!=""){
      query=  {orderId:orderNo,deleted_at:null} 
  }

  // Search by user email number
  else if(userMail!=""){
      if(validateEmail(req.query.userMail)==false){
          return res.status(400).send({ status: false, message: "Please enter valid email"})
      }
      else{
       const userId =  await userModel.findOne({email:userMail});
       query=  {userId:userId._id,deleted_at:null}
      }
  }

// Search by Order Status
 // orderstatus
  else if(order_status!=""){
      const status = [{key:1,value:'pending'}, {key:2, value:'completed'}, {key:3, value:'hold'},  {key:4, value:'cancelled'},
                  {key:5,value:'processing'},{key:6, value:'refund'},{key:7,value:'failed'}, {key:8, value:'fraud'},{key:9, value:'Active'}]
      status.filter((item, index, array) => {
              if(item.key==order_status){
                  query=  {orderstatus:item.value,deleted_at:null}
                }
       })
  }

// Search by payment method
  else if (payment_method!=""){
      const payment = [{key:1, value:"bitcoin"},{key:2, value:"razorpay"}]
      payment.filter((item,index,data) =>{
              if(item.key==payment_method){
                  query = {payment_method:item.value,deleted_at:null}
               }
      })
  }


  // All Data show in the list
  else{
         query=  {deleted_at:null}
     }
     // console.log(query);   
   const orderData = await orderModel.find(query).sort({createdAt: -1}).populate('userId',{ firstName: 1, lastName: 1, email:1});
   const countOrder = await orderModel.find(query).count();
   let orderList = [];
   let itemlist = [];
   if(countOrder>0){
      orderData.forEach((obj) => {
        orderList.push({
                     orderId: obj.orderId,
                     //items: obj.items,
                     amount: obj.amount,
                     email: obj.userId.email,
                     bitcoinAmountReceive:obj.bitcoinAmountReceive,
                     bitcoinAmount:obj.bitcoinAmount,
                     txid:obj.txid,
                     bitcoinAddress:obj.bitcoinAddress,
                     orderstatus:obj.orderstatus,
                     coupon:obj.coupon,
                     pay_url:obj.pay_url,
                     payment_status:obj.payment_status,
                     payment_method:obj.payment_method,
                     createdAt:obj.createdAt 
      });
    
    });
        let workbook = new excel.Workbook();
        let worksheet = workbook.addWorksheet("Tutorials");
            worksheet.columns = [
                            { header: "OrderId", key: "orderId", width: 5 },
                       //     { header: "Items", key: "items", width: 25 },
                            { header: "Amount", key: "amount", width: 25 },
                            { header: "Email", key: "email", width: 30 },
                            { header: "Order Status", key: "orderstatus", width: 15 },
                            { header: "Coupon", key: "coupon", width: 10 },
                            { header: "Payment Status", key: "payment_status", width: 25 },
                            { header: "Payment Method", key: "payment_method", width: 25 },
                            { header: "CreatedAt", key: "createdAt", width: 20 },

                ];

          // Add Array Rows
         worksheet.addRows(orderList); 
         
         res.setHeader(
              "Content-Type",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
              "Content-Disposition",
              "attachment; filename=" + `Report${new Date()}.xlsx`
            );
          
            return workbook.xlsx.write(res).then(function () {
              res.status(200).end();
            });
    }
    else{
      return res.status(400).send({ status: false, message: "No Order in the list"})
    }

  // let workbook = new excel.Workbook();
  // let worksheet = workbook.addWorksheet("Tutorials");
  // worksheet.columns = [
  //     { header: "Id", key: "id", width: 5 },
  //     { header: "Title", key: "title", width: 25 },
  //     { header: "Description", key: "description", width: 25 },
  //     { header: "Published", key: "published", width: 10 },
  //   ];
  //   res.setHeader(
  //     "Content-Type",
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //   );
  //   res.setHeader(
  //     "Content-Disposition",
  //     "attachment; filename=" + "tutorials.xlsx"
  //   );
  
  //   return workbook.xlsx.write(res).then(function () {
  //     res.status(200).end();
  //   });
       
}



 module.exports = { getAllOrders, getInvoice, dwonloadReport, singleOrder, deleteOrder, getDeletedOrders}