// const multer = require('multer');
// const util = require("util");
// require('dotenv').config();
// const directoryPathCate = process.env.UPLOAD_CATEGORY;
// const directoryPathPro =  process.env.UPLOAD_PRODUCT;
// const pagePath = process.env.UPLOAD_PAGE;
// const faqsPath = process.env.UPLOAD_FAQ;
// const blogPath = process.env.UPLOAD_BLOG;
// const testimonialPath = process.env.UPLOAD_TESTiMONIAL
// //******************************************************************************
// // CATEGORY SECTION                                                            *
// //******************************************************************************
// const imageStorage = multer.diskStorage({
//     // Destination to store image
//     destination: directoryPathCate,
//       filename: (req, file, cb) => {
//           cb(null, file.fieldname + '_' + Date.now()+".jpg")
//             // file.fieldname is name of the field (image)
//             // path.extname get the uploaded file extension
//     }
// });

// const imageUpload = multer({
//     storage: imageStorage,
//     limits: {
//       fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//     },
//     fileFilter(req, file, cb) {
//       if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//          // upload only png and jpg format
//          return cb(new Error('Please upload a Image'))
//        }
//      cb(undefined, true)
//   }
// }).single('image');
// let categoryImg = util.promisify(imageUpload);

// //******************************************************************************
// // PRODUCT SECTION                                                             *
// //******************************************************************************
// const productimageStorage = multer.diskStorage({
//   // Destination to store image
//   destination: directoryPathPro,
//        filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()+".jpg")

//   }
// });
// const proimageUpload = multer({
//   storage: productimageStorage,
//   limits: {
//     fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }).single('image');
// let productImg = util.promisify(proimageUpload);

// // //******************************************************************************
// // // Pages SECTION                                                             *
// // //******************************************************************************
// const pagesStorage = multer.diskStorage({
//   // Destination to store image
//   destination: pagePath,
//        filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()+".jpg")

//   }
// });
// const pageUpload = multer({
//   storage: pagesStorage,
//   limits: {
//     fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }).single('image');
// let pageImg = util.promisify(pageUpload);

// //******************************************************************************
// // FAQ SECTION                                                             *
// //******************************************************************************
// const faqsStorage = multer.diskStorage({
//   // Destination to store image
//   destination: faqsPath,
//        filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()+".jpg")

//   }
// });
// const faqUpload = multer({
//   storage: faqsStorage,
//   limits: {
//     fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }).single('image');
// let faqImg = util.promisify(faqUpload);

// //******************************************************************************
// // BLOG SECTION                                                             *
// //******************************************************************************
// const blogStorage = multer.diskStorage({
//   // Destination to store image
//   destination: blogPath,
//        filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()+".jpg")

//   }
// });
// const blogUpload = multer({
//   storage: blogStorage,
//   limits: {
//     fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }).single('image');
// let blogImg = util.promisify(blogUpload);

// //******************************************************************************
// // TESTIMONIAL SECTION                                                            *
// //******************************************************************************
// const testimonialStorage = multer.diskStorage({
//   // Destination to store image
//   destination: testimonialPath,
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now()+".jpg")
//           // file.fieldname is name of the field (image)
//           // path.extname get the uploaded file extension
//   }
// });

// const testimonialUpload = multer({
//   storage: testimonialStorage,
//   limits: {
//     fileSize: process.env.FILE_UPLOAD_SIZE // 1000000 Bytes = 1 MB
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
//        // upload only png and jpg format
//        return cb(new Error('Please upload a Image'))
//      }
//    cb(undefined, true)
// }
// }).single('image');
// let testimonialImg = util.promisify(testimonialUpload);

// module.exports = {categoryImg, productImg, testimonialImg, blogImg, faqImg,pageImg}

/**
 * @file fileUpload.js
 * @description This file provides configuration and middleware functions for handling file uploads in a Node.js/Express application.
 * It utilizes the multer library to manage file storage, size limits, and file type validation.
 * @version 1.0
 * @last_modified November 28, 2023
 */

const multer = require("multer");
const util = require("util");

/**
 * @constant {Array} allowedFileTypes
 * @description Array of allowed file types for image uploads.
 */
const allowedFileTypes = ["png", "jpg", "jpeg", "webp", "svg"];

/**
 * @constant {Object} config
 * @description Configuration object containing upload paths and file-related settings.
 */
const config = {
  UPLOAD_CATEGORY: process.env.UPLOAD_CATEGORY || "upload/category/",
  UPLOAD_PRODUCT: process.env.UPLOAD_PRODUCT || "upload/product/",
  UPLOAD_PAGE: process.env.UPLOAD_PAGE || "upload/page/",
  UPLOAD_FAQ: process.env.UPLOAD_FAQ || "upload/faq/",
  UPLOAD_BLOG: process.env.UPLOAD_BLOG || "upload/blog/",
  UPLOAD_TESTIMONIAL: process.env.UPLOAD_TESTIMONIAL || "upload/testimonial/",
  UPLOAD_SERVICE: "public/images/Services/", 
  FILE_UPLOAD_SIZE: process.env.FILE_UPLOAD_SIZE || 10000000000000,
  // ... other configuration values
};

/**
 * @function handleError
 * @description Helper function to handle errors during file uploads.
 * @param {Object} res - The Express response object.
 * @param {number} status - The HTTP status code for the response.
 * @param {string} message - The error message to be sent in the response.
 */
const handleError = (res, status, message) => {
  console.error(message);
  res.status(status).json({ error: message });
};

/**
 * @function createStorage
 * @description Creates a multer disk storage configuration for file uploads.
 * @param {string} destination - The destination directory for storing uploaded files.
 * @returns {Object} - Returns a multer disk storage configuration.
 */
const createStorage = (destination) =>
  multer.diskStorage({
    destination,
    filename: (req, file, cb) =>
      // cb(null, `${file.fieldname}_${Date.now()}.jpg`),
      cb(null, `${file.fieldname}_${Date.now()}.${file.originalname.split('.').pop()}`),
  });

/**
 * @function createUploadMiddleware
 * @description Creates a multer middleware for file uploads based on provided storage configuration.
 * @param {Object} storage - The multer storage configuration object.
 * @returns {Function} - Returns the multer middleware function.
 */
const createUploadMiddleware = (storage) =>
  multer({
    storage,
    limits: { fileSize: config.FILE_UPLOAD_SIZE },
    fileFilter(req, file, cb) {
      const isValidFileType = file.originalname.match(
        new RegExp(`\\.(${allowedFileTypes.join("|")})$`)
      );
      isValidFileType
        ? cb(null, true)
        : handleError(cb, 400, "Please upload a valid image");
    },
  }).any();

/**
 * @function promisifyMiddleware
 * @description Converts a multer middleware function to a promise-based function.
 * @param {Function} middleware - The multer middleware function.
 * @returns {Function} - Returns a promisified version of the middleware function.
 */
const promisifyMiddleware = (middleware) => util.promisify(middleware);

/**
 * @function createImageMiddleware
 * @description Creates a promisified middleware function for image uploads with a specified upload path.
 * @param {string} uploadPath - The path where uploaded images will be stored.
 * @returns {Function} - Returns a promisified middleware function for image uploads.
 */
const createImageMiddleware = (uploadPath) =>
  promisifyMiddleware(createUploadMiddleware(createStorage(uploadPath)));

/**
 * @constant {Function} categoryImg
 * @description Middleware function for handling category image uploads.
 */
const categoryImg = createImageMiddleware(config.UPLOAD_CATEGORY);

/**
 * @constant {Function} productImg
 * @description Middleware function for handling product image uploads.
 */
const productImg = createImageMiddleware(config.UPLOAD_PRODUCT);

/**
 * @constant {Function} pageImg
 * @description Middleware function for handling page image uploads.
 */
const pageImg = createImageMiddleware(config.UPLOAD_PAGE);

/**
 * @constant {Function} faqImg
 * @description Middleware function for handling FAQ image uploads.
 */
const faqImg = createImageMiddleware(config.UPLOAD_FAQ);

/**
 * @constant {Function} blogImg
 * @description Middleware function for handling blog image uploads.
 */
const blogImg = createImageMiddleware(config.UPLOAD_BLOG);

/**
 * @constant {Function} testimonialImg
 * @description Middleware function for handling testimonial image uploads.
 */
const testimonialImg = createImageMiddleware(config.UPLOAD_TESTIMONIAL);

/**
 * @constant {Function} mainServiceImg
 * @description Middleware function for handling MainService image uploads.
 */
const ServiceImg = createImageMiddleware(config.UPLOAD_SERVICE); 

module.exports = {
  categoryImg,
  productImg,
  testimonialImg,
  blogImg,
  faqImg,
  pageImg,
  ServiceImg,
};
