const Testimonial = require("../Models/TestimonialModel");
const asyncHandler = require("express-async-handler");
const {testimonialImg} = require("../Middleware/fileUpload")
const fs = require('fs');
require('dotenv').config();
const directoryPath = process.env.UPLOAD_TESTiMONIAL;


// create Testimonial
const create  = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].testimonial.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        await testimonialImg(req, res, async function (err) {
          if (err) {
              return res.status(400).send({ status: false, massage: "Please check the image format" })
          } else {
             const {title, description, rating} = req.body
             const image = req.file ? req.file.filename : req.file?.filename

                if (!(title)) {
                    return res.status(400).send({ status: false, massage: "Testimonial title is required!" })
                }
                if (!(description)) {
                    return res.status(400).send({ status: false, massage: "Description is required!" })
                }
                if (!(rating)) {
                    return res.status(400).send({ status: false, massage: "Rating  is required!" })
                }
            
                if(!parseInt(rating)){
                    return res.status(400).send({ status: false, massage: "Rating must be interger number!" })
                }
                const query = {title:title,description:description,rating:rating,image:image }
                      await Testimonial.create(query);
             res.status(200).send({ status: true, message: "Testimonial created succesfully" });
          }
        });  
  }
  else{
    return res.status(400).send({ status: false, message: "Access deny create blog !" })
  } 
  } 
  catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Update a Testimonial

const update = asyncHandler(async (req, res) => {
  const { testID } = req.query;
  
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].testimonial.update== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        await testimonialImg(req, res, async function (err) {
          if (err) {
              return res.status(400).send({ status: false, massage: "Please check the image format" })
          } else {
             const {title, description,rating} = req.body
             const image = req.file ? req.file.filename : req.file?.filename
             // check the file is exist in upload time 
               if(image){
                 let oldFileName = '';
                 const oldImage =   await Testimonial.findOne({ _id: testID })
                                    oldFileName = oldImage?.image
                       if(oldFileName!=""){
                            if (fs.existsSync(directoryPath+oldFileName)) {
                                             fs.unlink(directoryPath + oldFileName, (err) => {
                                            if(err){
                                            return res.status(400).send({ status: false, message: err.message })
                                         }
                                    });
                                 } 
                            }
                      }
              const query = {title:title,description:description,rating:rating,image:image }
              await Testimonial.findByIdAndUpdate(testID, {$set:query});
             res.status(200).send({ status: true, message: "Testimonail updated succesfully" });
          }
        });  
  }
  else{
    return res.status(400).send({ status: false, message: "Access deny update testimonial !" })
  } 
  } catch (error) {
   return res.status(400).send({ status: false, message: error.message })
  }
});

// Fetch a Testimonial
const get = asyncHandler(async (req, res) => {
  const { testID } = req.query;
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].testimonial.read== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const get = await Testimonial.findOne({_id:testID});
        res.status(200).send({ status: true,  data: get});
     }
  else{
    return res.status(400).send({ status: false, massage: "Access deny get testimonial !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Get All Testimonial

const getAll = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].testimonial.read== true
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
        const search = req.query.search
        const testimonialData = (search)?await Testimonial.find({title:{'$regex':search}}).limit(limitValue).skip(skipValue):await Testimonial.find().limit(limitValue).skip(skipValue);
        const count = (search)?await Testimonial.find({title:{'$regex':search}}).limit(limitValue).skip(skipValue).count():await Testimonial.find().limit(limitValue).skip(skipValue).count();
        if(count>0){
            res.status(200).send({ status: true, totalCount:count, page:skipValue, limit:limitValue, data: testimonialData});
            }
        else{
            return res.status(400).send({ status: false, massage: "No testimonial in list" })
        }    
       }
  else{
    return res.status(400).send({ status: false, massage: "Access deny get all blog !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Delete  Testimonial

const deleted = asyncHandler(async (req, res) => {
  const { testID } = req.query;
  
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].testimonial.delete== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const getList = await Testimonial.findOne({ _id: testID });
        if (getList) {
            let oldFileName = '';
             oldFileName = getList.image
            // check in files is exist in database
             if (oldFileName) {
                 fs.unlink(directoryPath + oldFileName, (err) => {
                    if(err){
                        return res.status(400).send({ status: false, message: err.message })
                     }
                 });
             }
          } 
         await Testimonial.findByIdAndDelete(testID);
         res.status(200).send({ status: true, message: "Testimonial deleted succesfully" });
  } 

else{
  return res.status(400).send({ status: false, massage: "Access deny delete Testimonial !" })
} 
}
  catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Update the status
const updateStatus = async function(req,res){
    const { testID } = req.query;
 
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].testimonial.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
           const status = req.body.status==1?true:false
           const query ={status:status}
           const data=  await Testimonial.updateOne({_id:testID}, {$set:query});
           res.status(200).send({ status: true, message: "Testimonial status is changed succesfully" });
    } 
  
  else{
    return res.status(400).send({ status: false, massage: "Access deny update status Testimonial !" })
  } 
  }
    catch (error) {
      return res.status(400).send({ status: false, message: error.message })
    }




}



module.exports = {create, update, get, getAll, deleted, updateStatus };
