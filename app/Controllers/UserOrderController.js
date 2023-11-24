'use strict';
const orderModel = require("../Models/OrderModel")
const fs = require('fs');
const path = require("path");
const InvoiceGenerator = require("../Helpers/PDFHelper")
require('dotenv').config();
// all order in user panel
const getAllOrders = async function(req, res){
    let getList="" ;
    const UserInfo = req.userId
     try {
         if(UserInfo.roleType=="user"){
           getList= true
         }
         const limitValue = parseInt(req.query.limit || '');
         const skipValue = parseInt(req.query.skip || 0);
         const orderType = req.query.orderType
         let query = ""
        if(orderType==1){
          query=  {userId:UserInfo._id,orderstatus:"pending",deleted_at:null}
          console.log(query);
        }
       else if(orderType==2){
            query=  {userId:UserInfo._id,payment_status:"paid",deleted_at:null}
        }
        else{
            query=  {userId:UserInfo._id,deleted_at:null}
            console.log(query);
        }
         const orderData = await orderModel.find(query).limit(limitValue).skip(skipValue);
         const countOrder = await orderModel.find(query).count();
         if(countOrder>0){
            return res.status(200).send({ status: true, countOrder:countOrder, data:orderData})
          }
          else{
            return res.status(400).send({ status: false, message: "No Order in the list"})
          }
        }
        catch (err) {
            return res.status(400).send({ status: false, message: err.message })
         }
 }

 
 const getInvoice =  async function(req, res){
    let getList="" ;
    const UserInfo = req.userId
     try {
         if(UserInfo.roleType=="user"){
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

    const pdfDwonload = async function(req, res){
      let getList="" ;
      const UserInfo = req.userId
      const orderId = req.query.orderId
      const query=  {userId:UserInfo._id, orderId:orderId, orderstatus:"completed",payment_status:"paid",deleted_at:null}
      const orderData = await orderModel.findOne(query).populate('userId',{ firstName: 1, lastName: 1, email:1,mobile:1});;
      const countOrder = await orderModel.findOne(query).count();
       try {
         if(UserInfo.roleType=="user"){
              getList= true
          }
          if(getList== true){
           
           if(countOrder>0){
            const invoiceData =  orderData;
            const ig =  new  InvoiceGenerator(invoiceData)
                   ig.generate(req, res)
            const pdf_file = `${process.env.BASE_URL}:${process.env.NODE_PORT}/pdf/Invoice_${orderId}.pdf`;
            return res.status(200).send({ status: true, data:pdf_file})
           
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
  




  
 module.exports = { getAllOrders, getInvoice,pdfDwonload }