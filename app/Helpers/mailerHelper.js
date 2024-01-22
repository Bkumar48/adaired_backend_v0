const nodemailer = require('nodemailer')
const util = require("util");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.POST,
    auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
    },
  });
  
module.exports = transporter  


