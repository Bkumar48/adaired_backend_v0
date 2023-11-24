'use strict';
const transporter = require("../Helpers/mailerHelper");
require('dotenv').config();
exports.emailSend = async(tomail,Subject,data,)=>{
    var mailOptions = {
        from: process.env.USER_FROM,
        to: "vijay@adaired.com",
       // bcc: "bittu@adaired.com",
        subject:Subject,
        html: data,
        };
        transporter.verify((error, success) =>{
                      if(error){
                        return res.status(400).send({ status: false, message: error.message })
                     }
                 else{
                   //  console.log("Mail server is running....!");
                 }
             })
         transporter.sendMail(mailOptions, function(error, info){
             if (error) {
                return res.status(400).send({ status: false, message: error.message })
             } else {
                 return res.status(200).send({ status: true, massage:"Your ticket submit successfuly" })
             }
         }) 
}
