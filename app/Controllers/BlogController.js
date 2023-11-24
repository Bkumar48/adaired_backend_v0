const Blog = require("../Models/BlogModal");
const asyncHandler = require("express-async-handler");
const {blogImg} = require("../Middleware/fileUpload")
const fs = require('fs');
require('dotenv').config();
const directoryPath = process.env.UPLOAD_BLOG;
const createBlog = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs.create== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        await blogImg(req, res, async function (err) {
          if (err) {
              return res.status(400).send({ status: false, massage: "Please check the image format" })
          } else {
             const {title, description,category, slug} = req.body
             const image = req.file ? req.file.filename : req.file?.filename
             const autherId = UserInfo._id;
             const query = {title:title,description:description,category:category,author:autherId,slug:slug,image:image }
             const newBlog = await Blog.create(query);
             res.status(200).send({ status: true, message: "Blog created succesfully" });
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

// Update a blog

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.query;
  
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs.update== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        await blogImg(req, res, async function (err) {
          if (err) {
              return res.status(400).send({ status: false, massage: "Please check the image format" })
          } else {
             const {title, description,category, slug} = req.body
             const image = req.file ? req.file.filename : req.file?.filename
             const autherId = UserInfo._id;
              // check the file is exist in upload time 
              if(image){
                let oldFileName = '';
                const oldImage =   await Blog.findOne({ _id: id })
                                    oldFileName = oldImage.image
                                    fs.unlink(directoryPath + oldFileName, (err) => {
                                    return res.status(400).send({ status: false, message: err.message })
                                    });
               }
              const query = {title:title,description:description,category:category,author:autherId,slug:slug,image:image }
              const newBlog = await Blog.findByIdAndUpdate(id, {$set:query});
              res.status(200).send({ status: true, message: "Blog updated succesfully" });
          }
        });  
  }
  else{
    return res.status(400).send({ status: false, message: "Access deny update blog !" })
  } 
  } catch (error) {
   return res.status(400).send({ status: false, message: error.message })
  }
});

// Fetch a blog
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.query;
  // validateMongodbid(id);
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs.read== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){
        const getBlog = await Blog.findById(id).populate("likes").populate("dislikes").populate('category');
        res.status(200).send({ status: true,  data: getBlog});
  }
  else{
    return res.status(400).send({ status: false, massage: "Access deny get blog !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Get All blogs

const getAllBlogs = asyncHandler(async (req, res) => {
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs.read== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){

        const limitValue = parseInt(req.query.limit || 2);
        const skipValue = parseInt(req.query.skip || 0);
        const getBlogs = await Blog.find().limit(limitValue).skip(skipValue);
        res.status(200).send({ status: true, page:skipValue, limit:limitValue, data: getBlogs});
       }
  else{
    return res.status(400).send({ status: false, massage: "Access deny get all blog !" })
  } 
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// Delete a blogs

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.query;
  
  const UserInfo = req.userId
  let getList="" ;
  let permissions =""
  if(UserInfo.role[0]!=undefined){
      permissions = UserInfo.role[0].permissions[0].blogs.delete== true
  }
  try {
      if(UserInfo.roleType=="admin"){
          getList= true
       }
      if(UserInfo.roleType=="user" &&  permissions){
          getList= true
      }
      if(getList== true){

        const getList = await Blog.findOne({ _id: id });
        if (getList) {
            let oldFileName = '';
             oldFileName = getList.image
            // check in files is exist in database
            if (oldFileName) {
                fs.unlink(directoryPath + oldFileName, (err) => {
                });
            }
          } 
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.status(200).send({ status: true, message: "Blog deleted succesfully" });
  } 

else{
  return res.status(400).send({ status: false, massage: "Access deny delete blog !" })
} 
}
  catch (error) {
    return res.status(400).send({ status: false, message: error.message })
  }
});

// like blog
const liketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  // validateMongodbid(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isLiked = blog?.isLiked;
  // find if the user has disliked the blog
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});



// Dislike the Blog
const disliketheBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  // validateMongodbid(blogId);
  // Find the blog which you want to be liked
  const blog = await Blog.findById(blogId);
  // find the login user
  const loginUserId = req?.user?._id;
  // find if the user has liked the blog
  const isDisLiked = blog?.isDisliked;
  // find if the user has disliked the blog
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      { new: true }
    );
    res.json(blog);
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  liketheBlog,
  disliketheBlog

};
