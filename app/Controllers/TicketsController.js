"use strict";
require("dotenv").config();
const tickets = require("../Models/TicketsModel");
const UserModel = require("../Models/UserModel");
const transporter = require("../Helpers/mailerHelper");
const path = require("path");
const ejs = require("ejs");
const ObjectId = require("mongoose").Types.ObjectId;
// @route POST /api/v1/ticket/customer/ticketCreate
// @desc Create a ticket
// @access Private

// Create Ticket
 
const ticketCreate = async function (req, res){
    const customerId =  req.user_id
    const {subject, query} = req.body
    try{
            if(!subject){
                return res.status(400).send({ status: false, massage: "Subject is required" })  
            }
            if(!query){
                return res.status(400).send({ status: false, massage: "Query is required" })  
            }
             const templatePath = path.join(__dirname, "../../views/emailTeple.ejs.html")
             
             const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`
           
            if(customerId){
            const customerInfo = await customer.findOne({_id:customerId}).select(['-password', '-verify'])
            const ticketId = Math.random().toString(10).substr(2, 10);
            const qry = {userId:customerInfo._id, name:customerInfo.fullname, contact:customerInfo.phone, ticketId:ticketId, email:customerInfo.email,subject:subject,query:query,ticketBy:'customer',
            status:'open', read_status:'unread'};
            const insert = await tickets.create(qry)
            if(insert){
                const data = await ejs.renderFile(templatePath, { name: customerInfo.fullname, ticketId:ticketId,subject:subject,query:query, logo:logoPath  });
                const Subject = "Ticket"
                var mailOptions = {
                                    from: process.env.USER_FROM,
                                    to: customerInfo.email,
                                    subject:Subject,
                                    html: data,
                                    };
            }
 
            transporter.verify((error, success) =>{
                            if(error){
                                console.log(error);
                            }
                        else{
                            console.log("Mail server is running....!");
                        }
                    })
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                        return res.status(200).send({ status: true, massage:"Your ticket submit successfuly" })
                    }
                }) 
            }  
        }
    catch (err){
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong" })  
    }
}

// @route GET /api/v1/customer/ticket/ticketGet
// @desc Get All Tickets Creayed by LoggeIn Customer
// @access Private

// Get All tickets Created By Logged in Customer
const ticketGet = async function (req, res) {
    const userInfo = req.userId;
    const customerId = userInfo._id;
    try {
      const customerInfo = await UserModel.findOne({ _id: customerId }).select([
        "-password",
        "-verify",
      ]);
      const ticketInfo = await tickets
        .find({ userId: customerInfo._id })
        .select([
          "-userId",
          "-name",
          "-contact",
          "-assignedto",
          "-email",
          "-ticketBy",
          "-read_status",
        ]);
      if (ticketInfo) {
        return res.send({ status: true, data: ticketInfo });
      }
    } catch (err) {
  
      return res.send({ status: false, message: err.message });
    }
  };
  
  // @route GET api/ticket/customer/UserTicketGetById?ticketId=1234567890
  // @desc Get Ticket By Id
  // @access Private
  
  // Get ticket created by logged in customer by ticket id
  const userTicketGetById = async function (req, res) {
    const userInfo = req.userId;
    const customerId = userInfo._id;
    const ticketId = req.query.ticketId;
    try {
      const customerInfo = await UserModel.findOne({ _id: customerId }).select([
        "-password",
        "-verify",
      ]);
      const ticketInfo = await tickets
        .findOne({ _id: ticketId, userId: customerInfo._id })
        .select([
          "-userId",
          "-name",
          "-contact",
          "-assignedto",
          "-email",
          "-ticketBy",
          "-read_status",
        ]);
      if (ticketInfo) {
        return res.send({ status: true, data: ticketInfo });
      }
    } catch (err) {
      return res.send({ status: false, message: err.message });
    }
  };
  


// *********************************************************************************************************************
// ********************************************  ADMIN CONTROLLER  *****************************************************
// *********************************************************************************************************************


  
  
  // @route POST api/ticket/admin/adminticketCreate?userId=1234567890
  // @desc Raise Ticket By Admin
  // @access Private
  
  // Create Ticket
  const AdminticketCreate = async function (req, res) {
    const userId = req.query.userId;
    const { subject, query } = req.body;
    const userInfo = req.userId;
    let getList = "";
    let permissions = "";
    if (userInfo.role[0] != undefined) {
              permissions = userInfo.role[0].permissions[0].ticket.create == true;
    }
    if (userInfo.roleType === "admin"){ getList = true;}
    if (userInfo.roleType === "user" && permissions){ getList = true;}
    try {
          if (getList==true) {
                        if (!subject) {
                                return res.status(400).send({ status: false, massage: "Subject is required" });
                         }
      if (!query) {
                return res.status(400).send({ status: false, massage: "Query is required" });
          }
      const templatePath = path.join(__dirname,"../../views/emailTeple.ejs.html");
      const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`;
      if (userId) {
        const adminInfo = await UserModel.findOne({ _id: userId }).select([
          "-password",
          "-verify",
        ]);
        const fullname = adminInfo.firstName + " " + adminInfo.lastName;
        const ticketId = Math.random().toString(10).substr(2, 10);
        const qry = {
          userId: userId,
          name: fullname,
          contact: adminInfo.mobile,
          assignedto: "customer",
          ticketId: ticketId,
          email: adminInfo.email,
          subject: subject,
          query: query,
          ticketBy: "admin",
          status: "open",
          user_read_status:"unread",
          replied:Date()
        };
         const insert = await tickets.create(qry);
             if (insert) {
               const data = await ejs.renderFile(templatePath, {
                                     name: adminInfo.fullname,
                                     ticketId: ticketId,
                                     subject: subject,
                                     query: query,
                                     logo: logoPath,
                    });
          const Subject = "Ticket";
          // var mailOptions = {
          //                     from: process.env.USER_FROM,
          //                     to: adminInfo.email,
          //                     subject:Subject,
          //                     html: data,
          //                     };
            }
        // transporter.verify((error, success) => {
        //   if (error) {
        //     return res
        //       .status(400)
        //       .send({ status: false, message: error.message });
        //   } else {
        //     console.log("Mail server is running....!");
        //     return res
        //       .status(200)
        //       .send({ status: true, massage: "Your ticket submit successfuly" });
        //   }
        // });
        // transporter.sendMail(mailOptions, function(error, info){
        //     if (error) {
        //         console.log(error);
        //     } else {
        //         return res.status(200).send({ status: true, massage:"Your ticket submit successfuly" })
        //     }
        // })
        return res.status(200).send({ status: true, massage: "Your ticket submit successfuly" });
      }
     
    }
    else{
       
        return res.status(400).send({ status: false, massage: "Deny access create ticket" })
      }  
    } catch (err) {
      return res.status(400).send({ status: false, massage: err.message });
    }
  };
  
  
 // @Route GET api/ticket/admin/ticketGetAll
// @desc Get All Tickets
// @access Private

// Get all Tickets for admin
const ticketsGetAll = async function (req, res) {
    const userInfo = req.userId;
    let getList = "";
    let permissions = "";
    if (userInfo.role[0] != undefined) {
      permissions = userInfo.role[0].permissions[0].ticket.read == true;
    }
    try {
      if (userInfo.roleType === "admin") getList = true;
      if (userInfo.roleType === "user" && permissions) getList = true;
      if (getList) {
        const ticketInfo = await tickets.find();
        if (ticketInfo) {
          return res.send({ status: true, data: ticketInfo });
        }
      }
      else{
        return res.status(400).send({ status: false, massage: "Deny access all ticket show" })
      }
    } catch (error) {
      return res.status(400).send({ status: false, massage: error.message });
    }
  };
  
  // @route GET /api/v1/ticket/admin/ticketGetById?ticketId=1234567890
  // @desc Get Ticket By Id
  // @access Private
  
  // Get Ticket By Id
  const ticketGetById = async function (req, res) {
      const ticketId = req.query.ticketId;
      const userInfo = req.userId;
      let getList = "";
      let permissions = "";
      if (userInfo.role[0] != undefined) {
        permissions = userInfo.role[0].permissions[0].ticket.read == true;
      }
      try {
        if (userInfo.roleType === "admin") getList = true;
        if (userInfo.roleType === "user" && permissions) getList = true;
        if (getList) {
              const ticket = await tickets.findOne({ _id: ticketId });
              if (tickets) {
                  return res.status(200).send({ status: true, data: ticket });
              }
          }
          else{
            return res.status(400).send({ status: false, massage: "Deny access Single ticket show" })
          }
      } catch (err) {
          return res.status(400).send({ status: false, massage: err.message });
      }
  };
  
  // *********************************************************************************************************************
  // **********************************************  THREAD REPLY  *******************************************************
  // *********************************************************************************************************************
  
  
  // @route  POST api/v1/ticket/thread/?ticketId=5f7f1c1c1c1c1c1c1c1c1c1c
  // @desc   Create a thread
  // @access Private
  
  // Create Thread Reply
  const threadReply = async function (req, res) {
    const ticketId = req.query.ticketId;
    const { message } = req.body;
    const replier = req.userId;
    const replierId = replier._id;
    try {
      if (!message) {
        return res
          .status(400)
          .send({ status: false, massage: "Message is required" });
      }
  
      const templatePath = path.join(
        __dirname,
        "../../views/emailTeple.ejs.html"
      );
  
      const logoPath = `${process.env.BASE_URL}:${process.env.NODE_PORT}/images/mail_logo.webp`;
  
      if (replierId) {
        const replierInfo = await UserModel.findOne({ _id: replierId }).select([
          "-password",
          "-verify",
        ]);
        const replierMail = replierInfo.email;
        const qry = {user_read_status:"unread", replied:Date(),
          $push: {
            conversation: {
              message: message,
              repliedBy: ObjectId(replierId._id),
              repliedByRole: replierInfo.roleType,
            },
          },
        };
        
        const ticketInfo = await tickets.findOne({ _id: ticketId });
        const userMail = ticketInfo.email;
        const ticket = await tickets.findByIdAndUpdate(ticketId, qry, {
          new: true,
        });
          console.log(ticket);
        // if (ticket) {
        //   // const data = await ejs.renderFile(templatePath, { name: fullname, ticketId:ticketId ,message:message , logo:logoPath });
        //   const Subject = "Ticket";
        //   var mailOptions = {
        //     from: replierMail,
        //     to: replier.roleType !== "admin" ? process.env.ADMIN_MAIL : userMail,
        //     subject: Subject,
        //     // html: data,
        //   };
        // }
        // transporter.verify((error, success) => {
        //   if (error) {
        //     return res
        //       .status(400)
        //       .send({ status: false, message: error.message });
        //   } else {
        //     console.log("Mail server is running....!");
        //     return res
        //       .status(200)
        //       .send({
        //         status: true,
        //         message: "Your answer submitted successfuly",
        //       });
        //   }
        // });
        // transporter.sendMail(mailOptions, function (error, info) {
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     return res
        //       .status(200)
        //       .send({ status: true, massage: "Your ticket submit successfuly" });
        //   }
        // });
        return res.status(200).send({ status: true, massage: "Your ticket replied successfuly" });
      }
    } catch (err) {
      return res.status(400).send({ status: false, massage: err.message });
    }
  };
  
  const ticketStatusChnage = async function(req, res){
      const ticketId = req.query.ticketId;
      const status = req.body.status
      const userInfo = req.userId;
      let getList = "";
      let permissions = "";
      if (userInfo.role[0] != undefined) {
        permissions = userInfo.role[0].permissions[0].ticket.read == true;
      }
      try {
        if (userInfo.roleType === "admin") getList = true;
        if (userInfo.roleType === "user" && permissions) getList = true;
        if (getList) {
              const ticket = await tickets.findByIdAndUpdate(ticketId, {$set:{status:status}} );
              if (tickets) {
                  return res.status(200).send({ status: true,  massage: "Your ticket status changed successfuly"  });
              }
          }
          else{
            return res.status(400).send({ status: false, massage: "Deny access Single ticket show" })
          }
         } catch (err) {
          return res.status(400).send({ status: false, massage: err.message });
      }
   }





  module.exports = {
    ticketCreate,
    ticketGet,
    userTicketGetById,
    AdminticketCreate,
    ticketGetById,
    ticketsGetAll,
    threadReply,
    ticketStatusChnage,
  };