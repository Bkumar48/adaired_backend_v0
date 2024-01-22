'use strict';
const pages = require("../Models/PageModel");
const {pageImg} = require("../Middleware/fileUpload")
const slugify = require("slugify");
const fs = require('fs');
require('dotenv').config();
const {encrypt, decrypt} = require("../Middleware/EncryDecry")
const crypto = require('crypto');
//******************************************************************************
// PAge SECTION                                                            *
//******************************************************************************                                                                                
// Add Page 

const pageAdd = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].page.create== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        await pageImg(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ status: false, massage: "Please check the image format" })
            } else {
                const image = req.file ? req.file.filename : req.file?.filename
                const { title, description, slug, keyword, canonical_links, meta_title, meta_description } = req.body;
              
                 const checkSlug = await pages.findOne({ slug: slug }).count();
                if (checkSlug > 1) {
                    return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                }
                if (!(title)) {
                    return res.status(400).send({ status: false, massage: "Title field is required!" })
                }
                if (!(description)) {
                    return res.status(400).send({ status: false, massage: "Description field is required!" })
                }
                if (!(slug)) {
                    return res.status(400).send({ status: false, massage: "Slug field is required!" })
                }   
                
                  const query = { title: title, image: image, description:description, slug: slugify(slug), keyword:keyword, canonical_links:canonical_links, meta_title:meta_title, meta_description:meta_description}
                  await pages.create(query);
                  return res.status(200).send({ status: true, massage: "Page insert successfully! :)" })
            }
        })
    }
    else{
     return res.status(400).send({ status: false, massage: "Access deny!" })  
    }
    }
    catch (err) {
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}

 // get list of Page
const pageList = async function (req, res) {
    const UserInfo = req.userId
     let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].page.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
             const pageList = await pages.find();
              if (pageList) {
                  return res.status(200).send({ status: true, data: pageList })
                }
            else {
                return res.status(400).send({ status: false, massage: "No List of pages here!" })
            }
        }
    else{
        return res.status(400).send({ status: false, massage: "Access deny!" })  
       }
}
    catch (err) {
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
// get single single page  data
const getSinglePage = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].page.read== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const { pageId } = req.query
        const getList = await pages.find({ _id: pageId });
        if (getList) {
            return res.status(200).send({ status: true, data: getList })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of pages here!" })
        }
      }
      else{
        return res.status(400).send({ status: false, massage: "Access deny!" })  
       }
}
    catch (err) {
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}

// update Page 
const updateSinglePage = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].page.update== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" &&  permissions){
            getList= true
        }
        if(getList== true){
        const { pageId } = req.query
        const directoryPath = process.env.UPLOAD_PAGE;
        const getList = await pages.findOne({ _id: pageId });
        if (getList) {
            await pageImg(req, res, async function (err) {
                if (err) {
                    return res.status(400).send({ status: false, massage: "Please check the image format" })
                } else {
                    const image = req.file ? req.file.filename : req.file?.filename
                    // check the file is exist in upload time 
                    if(image){
                         let oldFileName = '';
                         const oldImage =   await pages.findOne({ _id: pageId })
                                             oldFileName = oldImage.image
                                              fs.unlink(directoryPath + oldFileName, (err) => {
                                               });
                        }
                    const { title, description, slug, keyword, canonical_links, meta_title, meta_description } = req.body;
                 
                    // const checkSlug = await pages.findOne({ slug: slug }).count();
                    // if (checkSlug > 1) {
                    //     return res.status(400).send({ status: false, massage: "Please check the slug is duplicate" })
                    // }
                    if (!(title)) {
                        return res.status(400).send({ status: false, massage: "Title field is required!" })
                    }
                    if (!(description)) {
                        return res.status(400).send({ status: false, massage: "Description field is required!" })
                    }
                    if (!(slug)) {
                        return res.status(400).send({ status: false, massage: "Slug field is required!" })
                    }
                     const query = { title: title, image: image, description:description, slug: slugify(slug), keyword:keyword, canonical_links:canonical_links, meta_title:meta_title, meta_description:meta_description}
                     await pages.findByIdAndUpdate(pageId, {$set:query});
                     return res.status(200).send({ status: true, massage: "Page update successfully! :)" })
                }
            })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of pages here!" })
        }
    }
    else{
      return res.status(400).send({ status: false, massage: "Access deny!" })  
     }
    }
    catch (err) {
        console.log(err);
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
   
 // delete page
const deletePage = async function (req, res) {
    const UserInfo = req.userId
    let getList="" ;
    let permissions =""
    if(UserInfo.role[0]!=undefined){
        permissions = UserInfo.role[0].permissions[0].page.delete== true
    }
    try {
        if(UserInfo.roleType=="admin"){
            getList= true
         }
        if(UserInfo.roleType=="user" && permissions){
            getList= true
        }
        if(getList== true){
        const { pageId } = req.query
        const getList = await pages.findOne({ _id: pageId });
        if (getList) {
            let oldFileName = '';
            const directoryPath = process.env.UPLOAD_PAGE;
            const oldImage = await pages.findOne({ _id: pageId })
            oldFileName = oldImage.image
            // check in files is exist in database
            if (oldFileName) {
                fs.unlink(directoryPath + oldFileName, (err) => {
                });
            }
            await pages.findByIdAndDelete(pageId)
            return res.status(200).send({ status: true, massage: "Page Deleted!" })
        }
        else {
            return res.status(400).send({ status: false, massage: "No List of pages here!" })
        }
       }  
    else{
      return res.status(400).send({ status: false, massage: "Access deny!" })  
     }
    }
    
    catch (err) {
        return res.status(400).send({ status: false, massage: "Something went wrong!" })
    }
}
  
const testEn = async function (req, res) {

 const v8 = require('v8');
  
// Calling v8.serialize() 
 const serlize = ("Decoding base64 to original string: The Buffer can also be used to convert the base64 string back to utf8 encoding. The Buffer.from() method is again used to convert the base64 string back to bytes, however, this time specifying the current encoding as “base64” The converted bytes can then be returned as the original utf8 string using the toString() method. In this case, “utf8” is specified as the encoding to be used. Thus, this method converts the base64 to its original utf9 format.");
 const enpt = encrypt(serlize);
 console.log(enpt);
 var spaceCount = (serlize.length - 1);
 console.log("count",spaceCount);
 var spaceCountenp = (enpt.length - 1);
 console.log("encount",spaceCountenp);
 const decpt = decrypt(enpt)   
 console.log(decpt)

}



module.exports = {pageAdd, pageList,  getSinglePage, updateSinglePage, deletePage,testEn}