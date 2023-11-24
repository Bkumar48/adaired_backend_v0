'use strict';
require('dotenv').config();
const tickets = require("../Models/TicketsModel")
const customer = require("../Models/CustomerModel")
const transporter = require("../Helpers/mailerHelper")
const path = require("path")
const ejs = require("ejs")

 
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

const ticketGet =  async function(req, res){
        const customerId =  req.user_id
       try{
        const customerInfo = await customer.findOne({_id:customerId}).select(['-password', '-verify'])   
       }
       catch(err){

       }

}

module.exports = {ticketCreate,ticketGet }