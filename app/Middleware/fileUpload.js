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

// fileUpload.js
const multer = require('multer');
const util = require('util');
const allowedFileTypes = ['png', 'jpg', 'jpeg', 'webp'];

const config = {
  UPLOAD_CATEGORY: process.env.UPLOAD_CATEGORY || 'upload/category/',
  UPLOAD_PRODUCT: process.env.UPLOAD_PRODUCT || 'upload/product/',
  UPLOAD_PAGE: process.env.UPLOAD_PAGE || 'upload/page/',
  UPLOAD_FAQ: process.env.UPLOAD_FAQ || 'upload/faq/',
  UPLOAD_BLOG: process.env.UPLOAD_BLOG || 'upload/blog/',
  UPLOAD_TESTIMONIAL: process.env.UPLOAD_TESTIMONIAL || 'upload/testimonial/',
  UPLOAD_MAIN_SERVICE: process.env.UPLOAD_MAIN_SERVICE || 'upload/mainService/', // Add this line
  FILE_UPLOAD_SIZE: process.env.FILE_UPLOAD_SIZE || 1000000,
  // ... other configuration values
};

const handleError = (res, status, message) => {
  console.error(message);
  res.status(status).json({ error: message });
};

const createStorage = (destination) => multer.diskStorage({
  destination,
  filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}.jpg`),
});

const createUploadMiddleware = (storage) => multer({
  storage,
  limits: { fileSize: config.FILE_UPLOAD_SIZE },
  fileFilter(req, file, cb) {
    const isValidFileType = file.originalname.match(new RegExp(`\\.(${allowedFileTypes.join('|')})$`));
    isValidFileType ? cb(null, true) : handleError(cb, 400, 'Please upload a valid image');
  },
}).single('image');

const promisifyMiddleware = (middleware) => util.promisify(middleware);

const createImageMiddleware = (uploadPath) =>
  promisifyMiddleware(createUploadMiddleware(createStorage(uploadPath)));

const categoryImg = createImageMiddleware(config.UPLOAD_CATEGORY);
const productImg = createImageMiddleware(config.UPLOAD_PRODUCT);
const pageImg = createImageMiddleware(config.UPLOAD_PAGE);
const faqImg = createImageMiddleware(config.UPLOAD_FAQ);
const blogImg = createImageMiddleware(config.UPLOAD_BLOG);
const testimonialImg = createImageMiddleware(config.UPLOAD_TESTIMONIAL);
const mainServiceImg = createImageMiddleware(config.UPLOAD_MAIN_SERVICE); // Add this line
module.exports = { categoryImg, productImg, testimonialImg, blogImg, faqImg, pageImg, mainServiceImg };
