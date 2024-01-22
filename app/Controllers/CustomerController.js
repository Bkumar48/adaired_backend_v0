'use strict';
const CustomerModel = require("../Models/CustomerModel");
const bcrypt = require('bcrypt');
const jwttoken = require("jsonwebtoken"); 
require('dotenv').config();
const transporter = require("../Helpers/mailerHelper")
const {validateEmail, validatePassword, validatePhone, phoneDigit, alphabet} = require("../Helpers/validationHelper")

// Customer Registered
const register =   async function(req, res){
    
    const {fullname, email, phone, password, conpassword}= req.body
    const emailValidation = validateEmail(email);
    const PasswordValidation = validatePassword(password);
    const PhoneValidation = validatePhone(phone, 10)

    const customerCheckMail = await CustomerModel.find({email:email}).count();

    if(customerCheckMail==1){
        return res.status(400).send({ status: false, massage: `${email} is already registred` })
    }

    if(emailValidation== false){
        return res.status(400).send({ status: false, massage: "You have entered wrong email format" })
    }
    if(PasswordValidation== false){
        return res.status(400).send({ status: false, massage: "Password with min 8 character along One Capital, One Small also with digist and symbole" })
    }
    
    if(PhoneValidation== false){
        return res.status(400).send({ status: false, massage: "You have entered the phone number is invalid" })
    }

    if(PhoneValidation== undefined){
        return res.status(400).send({ status: false, massage: "You have entered invalid number" })
    }
       
    if(!fullname){
        return res.status(400).send({ status: false, massage: "Fullname is required" })
    }

    if(!email){
        return res.status(400).send({ status: false, massage: "Email is required" })
    }

    if(!phone){
        return res.status(400).send({ status: false, massage: "Phone is required" })
    }

     if(phoneDigit(phone)==false){
        return res.status(400).send({ status: false, massage: "You have entered invalid number" })
    }
    if(!password){
        return res.status(400).send({ status: false, massage: "Password is required" })
    }

    if(!conpassword){
        return res.status(400).send({ status: false, massage: "confirm is required" })
    }

    if(password != conpassword){
        return res.status(400).send({ status: false, massage: "Confirm Password is not matched with password" })
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const query = {fullname:fullname, phone:phone, email:email,password:encryptedPassword};
    const createCustomer = await CustomerModel.create(query);
    let id = createCustomer._id
    
   // Send varification email
   const route = "/api/V1/customer/confirm"
   const Subject = "Varification"
   const token = jwttoken.sign({ user_id: id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
   const link = `${process.env.BASE_URL}:${process.env.NODE_PORT}${route}/?token=${token}`;
   var mailOptions = {
                         from: process.env.USER_FROM,
                         to: email,
                         subject:Subject,
                         text: link
             };

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
            return res.status(200).send({ status: true, massage:"The please verify your account the link send on your email" })
        }
    }) 
}

// Customer Verified account 
const confirm =   async function(req, res){
    const token = req.query.token
    try{
        if(token){
            const decoded = jwttoken.verify(token, process.env.JWT_SECRET);
            const user_id = decoded.user_id;
            const customer = await CustomerModel.findOne({_id:user_id})
                if(customer){
                    const verified = await CustomerModel.findByIdAndUpdate(user_id,{verify:true})
                    return res.status(200).send({ status: true, massage: "Your are verified !" })
              }   
        }
        else{
            return res.status(400).send({ status: false, massage: "Invalid token" })
        }
    }
    catch (err){
        return res.status(400).send({ status: false, massage: "Something went wrong" })
    }
 }

 // Customer Login 
const login = async function (req, res){
    try{
            const { email, password } = req.body;
            // all fields are required check blank 
            if (!(email && password)) {
                return res.status(400).send({ status: false, massage: "All the fields are required!" })
            }
            const emailValidation = validateEmail(email);
            const PasswordValidation = validatePassword(password);
            if(emailValidation== false){
                return res.status(400).send({ status: false, massage: "You have entered wrong email format" })
            }
            if(PasswordValidation== false){
                return res.status(400).send({ status: false, massage: "Password with min 8 character along One Capital, One Small also with digist and symbole" })
            }
            const customer = await CustomerModel.findOne({ email });
            const cpassword = await bcrypt.compare(password, customer.password)
            if(customer.verify==false){
                return res.status(400).send({ status: false, massage: "Verify your Email" })
            }
           
            // check user and password
            if (customer && cpassword) {
                const token = jwttoken.sign({ user_id: customer._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })
                return res.status(200).send({ status: true, massage: "Login successfully! :)", token: token })
            }
            else {
                return res.status(400).send({ status: false, massage: "you are use the wrong credential use!" })
            }
      }
    catch (err){
        return res.status(400).send({ status: false, massage: "Something went wrong" })
    }
}
// Get customer info 
const getCustomerInfo = async function(req, res){
   const customerId =  req.user_id
   try{
        if(customerId){
            const customerInfo = await CustomerModel.findOne({_id:customerId})
            const  customerName = customerInfo.fullname
            var fullname = customerName.split(" ");
            if(fullname[1] == undefined ){
                fullname[1] = ""
            }
            const obj = {first_name:fullname[0], last_name:fullname[1], phone:customerInfo.phone, email:customerInfo.email}
            return res.status(200).send({ status: true, customerInfo: obj })
         }   
   }
   catch (err){
      return res.status(400).send({ status: false, massage: "Something went wrong" })
   }
 }

// Update Customer info

const updateCustomerInfo = async function(req, res){
    const customerId =  req.user_id
    const {first_name, last_name, phone} = req.body
    try{
        
        if(!first_name){
            return res.status(400).send({ status: false, massage: "First name is required" })    
        }
        else if(alphabet(first_name)==false){
            return res.status(400).send({ status: false, massage: "You have not entred the text" })    
        }
        if(!phone){
            return res.status(400).send({ status: false, massage: "Phone is required" })   
        }
        else if(validatePhone(phone)== false){
            return res.status(400).send({ status: false, massage: "You have entered the phone number is invalid" })
        }
        else if(validatePhone(phone)== undefined){
            return res.status(400).send({ status: false, massage: "You have entered invalid number" })
        }
        else if(phoneDigit(phone)==false){
            return res.status(400).send({ status: false, massage: "You have entered invalid number" })
        }
        
        const last_name1 = (last_name == undefined )?"": last_name
        const fullname = first_name+" "+last_name1
        const Obj ={fullname:fullname, phone:phone} 
       if(customerId){
        await CustomerModel.findByIdAndUpdate(customerId,Obj)
        return res.status(200).send({ status: true, massage: "Update successfully! :)" })
       }
    }
    catch (err){
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong" })  
    }
}

// Customer Password update
const updateCustomerPass = async function(req, res){
    const customerId =  req.user_id
    const {current_pass, new_pass, confirm_pass} = req.body
    try{
        
        if(!current_pass){
            return res.status(400).send({ status: false, massage: "Current Password is required" })
        }

       else if(validatePassword(current_pass)==false){
            return res.status(400).send({ status: false, massage: "Current Password with min 8 character along One Capital, One Small also with digist and symbole" })
        }

        if(!new_pass){
            return res.status(400).send({ status: false, massage: "New Password is required" })
        }

       else if(validatePassword(new_pass)==false){
            return res.status(400).send({ status: false, massage: "New Password with min 8 character along One Capital, One Small also with digist and symbole" })
        }

        if(!confirm_pass){
            return res.status(400).send({ status: false, massage: "Confirm Password is required" })
        }

        else if(validatePassword(confirm_pass)==false){
            return res.status(400).send({ status: false, massage: "Confirm Password with min 8 character along One Capital, One Small also with digist and symbole" })
        }

        if(new_pass != confirm_pass){
            return res.status(400).send({ status: false, massage: "New Password is not matach with confirm password" })
        }

        const customer = await CustomerModel.findOne({ _id:customerId });
        const cpassword = await bcrypt.compare(current_pass, customer.password)

        if(cpassword==false){
            return res.status(400).send({ status: false, massage: "Current password is not fount" })
        }
        else{
            const encryptedPassword = await bcrypt.hash(new_pass, 10);
            const Obj ={password:encryptedPassword} 
            if(customerId){
             await CustomerModel.findByIdAndUpdate(customerId,Obj)
             return res.status(200).send({ status: true, massage: "Password update successfully! :)" })
            }
        }

    }
    catch (err){
      
        return res.status(400).send({ status: false, massage: "Something went wrong" })  
    }
   

}  




module.exports = {register, confirm, login, getCustomerInfo,updateCustomerInfo,updateCustomerPass};