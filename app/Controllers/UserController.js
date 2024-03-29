// const { role, permission } = require("../Models/RoleModel");
// const bcrypt = require("bcrypt");
// const jwttoken = require("jsonwebtoken");
// const { StatusCodes } = require("http-status-codes");
// const UserModel = require("../Models/UserModel");
// const asyncHandler = require("express-async-handler");
// const {
//   validateEmail,
//   validatePassword,
//   validatePhone,
// } = require("../Helpers/validationHelper");
// require("dotenv").config();

// // -----------------------------Create a new user--------------------------------

// const createUser = asyncHandler(async (req, res) => {
//   try {
//     const { email, password, firstName, lastName, contact } = req.body;

//     validateFields({ firstName, lastName, email, password, contact });
//     validateEmail(email);
//     validatePassword(password);
//     validatePhone(contact);

//     const roleType = await determineRoleType();

//     const encryptedPassword = await bcrypt.hash(password, 10);

//     if (await UserModel.exists({ email })) {
//       throw createError(
//         StatusCodes.CONFLICT,
//         `User with email: ${email} already exists!`
//       );
//     }

//     const { _id: userId } = await UserModel.create({
//       firstName: firstName,
//       lastName: lastName,
//       userName: extractUsername(email),
//       email: email.toLowerCase(),
//       contact: contact,
//       password: encryptedPassword,
//       roleType,
//       status: 1,
//     });

//     const token = generateToken(userId);

//     await UserModel.findByIdAndUpdate(userId, {
//       $set: { refreshToken: token },
//     });

//     res.status(StatusCodes.CREATED).send({
//       status: true,
//       message: "User is Registered Successfully! :)",
//       token,
//     });
//   } catch (err) {
//     const status = err.statusCode || StatusCodes.BAD_REQUEST;
//     res.status(status).send({ status: false, message: err.message });
//   }
// });

// async function determineRoleType() {
//   return (await UserModel.countDocuments({ roleType: "admin" })) === 0
//     ? "admin"
//     : "user";
// }

// function validateFields(fields) {
//   for (const [field, value] of Object.entries(fields)) {
//     if (!value) {
//       throw createError(
//         StatusCodes.BAD_REQUEST,
//         `${getFieldName(field)} is required!`
//       );
//     }
//   }
// }

// function getFieldName(field) {
//   return field.replace("_", " ");
// }

// function extractUsername(email) {
//   const username = email.split("@");
//   return username.length === 2 ? username[0] : null;
// }

// function generateToken(userId) {
//   return jwttoken.sign({ user_id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
// }

// function createError(statusCode, message) {
//   const error = new Error(message);
//   error.statusCode = statusCode;
//   return error;
// }

// // -----------------------------Login a user--------------------------------
// const loginUserCtrl = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   console.log(req.body);

//   try {
//     if (!email || !password) {
//       throw createError(
//         StatusCodes.BAD_REQUEST,
//         "All the fields are required!"
//       );
//     }

//     const user = await UserModel.findOne({ email });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       throw createError(
//         StatusCodes.BAD_REQUEST,
//         "You have entered the wrong credentials!"
//       );
//     }

//     const token = jwttoken.sign(
//       { user_id: user._id, urole: user.roleType, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_LIFETIME }
//     );

//     await UserModel.findByIdAndUpdate(user._id, {
//       $set: { refreshToken: token },
//     });

//     res.status(StatusCodes.OK).send({
//       status: true,
//       message: "Login successfully! :)",
//       token,
//     });
//   } catch (err) {
//     const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
//     res.status(status).send({ status: false, message: err.message });
//   }
// });

// // get all users
// const getallUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   let getList = "";
//   let permissions = "";
//   if (UserInfo.role[0] != undefined) {
//     permissions = UserInfo.role[0].permissions[0].users.read == true;
//   }
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }

//     if (UserInfo.roleType == "user" && permissions) {
//       getList = true;
//     }
//     if (getList == true) {
//       const getUsers = await UserModel.find()
//         .populate("role")
//         .select("-password");
//       return res.status(200).send({ status: true, data: getUsers });
//     } else {
//       return res
//         .status(400)
//         .send({ status: false, massage: "Deny access all users" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// });

// // get One user
// const getoneUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   let getList = "";
//   // let permissions =""
//   const user_Id = req.query.userId;
//   // if(UserInfo.role[0]!=undefined){
//   //     permissions = UserInfo.role[0].permissions[0].users.read== true
//   // }
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }

//     // if(UserInfo.roleType=="user" &&  permissions){
//     //     getList= true
//     // }
//     if (UserInfo.roleType == "user") {
//       getList = true;
//     }

//     if (getList == true) {
//       const getoneUser = await UserModel.findById(user_Id)
//         .populate("role")
//         .select("-password");
//       return res.status(200).send({ status: true, data: getoneUser });
//     } else {
//       return res
//         .status(400)
//         .send({ status: false, massage: "Deny access single list  users" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// });

// // push Role to user
// const pushRoleToUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   let getList = "";
//   let permissions = "";
//   if (UserInfo.role[0] != undefined) {
//     permissions = UserInfo.role[0].permissions[0].users.update == true;
//   }
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }

//     if (UserInfo.roleType == "user" && permissions) {
//       getList = true;
//     }
//     if (getList == true) {
//       const { userId, roleId } = req.body;
//       console.log(req.body);
//       // const roleID = await role.findById(roleId);
//       const user = await UserModel.findByIdAndUpdate(userId, {
//         $set: { role: roleId },
//       });
//       return res.status(200).send({
//         status: true,
//         massage: "A Sign the role to user successfully! :)",
//       });
//     } else {
//       return res
//         .status(400)
//         .send({ status: false, massage: "Deny access users permission" });
//     }
//   } catch (err) {
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// });

// //Update a user
// const updateaUser = asyncHandler(async (req, res) => {
//   const { userId } = req.query;
//   const UserInfo = req.userId;
//   let getList = "";
//   // let permissions =""
//   // if(UserInfo.role[0]!=undefined){
//   //     permissions = UserInfo.role[0].permissions[0].users.update== true
//   // }
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }

//     // if(UserInfo.roleType=="user" &&  permissions){
//     //     getList= true
//     // }
//     if (UserInfo.roleType == "user") {
//       getList = true;
//     }
//     if (getList == true) {
//       const updateaUser = await UserModel.findByIdAndUpdate(
//         userId,
//         {
//           firstName: req?.body.firstname,
//           lastName: req?.body.lastname,
//           //   mobile: req?.body.mobile,
//           //   status: req?.body.status,
//         },
//         {
//           new: true,
//         }
//       );
//       return res
//         .status(200)
//         .send({ status: true, massage: "User Update successfully! :)" });
//     } else {
//       return res
//         .status(400)
//         .send({ status: false, massage: "Deny access users update" });
//     }
//   } catch (err) {
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// });

// // Delete a user
// const deleteaUser = asyncHandler(async (req, res) => {
//   const { userId } = req.query;
//   const UserInfo = req.userId;
//   let getList = "";
//   let permissions = "";
//   if (UserInfo.role[0] != undefined) {
//     permissions = UserInfo.role[0].permissions[0].users.delete == true;
//   }
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }
//     if (UserInfo.roleType == "user" && permissions) {
//       getList = true;
//     }
//     if (getList == true) {
//       const deleteaUser = await UserModel.findByIdAndDelete(userId);
//       return res
//         .status(200)
//         .send({ status: true, massage: "User delete successfully! :)" });
//     } else {
//       return res
//         .status(400)
//         .send({ status: false, massage: "Deny access users update" });
//     }
//   } catch (err) {
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// });

// // get user password
// const getPassword = async function (req, res) {
//   const UserInfo = req.userId;
//   const userID = UserInfo._id;
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }
//     if (UserInfo.roleType == "user") {
//       getList = true;
//     }
//     if (getList == true) {
//       const user = await UserModel.findOne({ _id: userID }).select("password");
//       return res.status(200).send({ status: true, data: user });
//     }
//   } catch (err) {
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// };

// // Chnage user password
// const updatePassword = async function (req, res) {
//   const UserInfo = req.userId;
//   const userID = UserInfo._id;
//   try {
//     if (UserInfo.roleType == "admin") {
//       getList = true;
//     }
//     if (UserInfo.roleType == "user") {
//       getList = true;
//     }
//     if (getList == true) {
//       const { oldpassword, newpassword, cpassword } = req.body;
//       if (!(newpassword && cpassword)) {
//         return res
//           .status(400)
//           .send({ status: false, massage: "All the fields are required!" });
//       } else if (validatePassword(newpassword) == false) {
//         return res.status(400).send({
//           status: false,
//           massage:
//             "Password with min 8 character along One Capital, One Small also with digist and symbole",
//         });
//       } else {
//         const user = await UserModel.findById({ _id: userID });
//         const mpassword = await bcrypt.compare(oldpassword, user.password);
//         if (mpassword == true) {
//           if (newpassword == cpassword) {
//             const encryptedPassword = await bcrypt.hash(newpassword, 10);
//             const update = await UserModel.findByIdAndUpdate(
//               { _id: userID },
//               { $set: { password: encryptedPassword } }
//             );
//             if (update) {
//               return res.status(200).send({
//                 status: true,
//                 massage: "Password has chnaged successfully! :)",
//               });
//             }
//           } else {
//             return res.status(400).send({
//               status: false,
//               massage: "New password and Confirm password is not match! :)",
//             });
//           }
//         } else {
//           return res.status(400).send({
//             status: false,
//             massage: "You have entered the wrong password !",
//           });
//         }
//       }
//     }
//   } catch (err) {
//     return res.status(400).send({ status: false, massage: err.message });
//   }
// };

// module.exports = {
//   createUser,
//   loginUserCtrl,
//   getallUser,
//   getoneUser,
//   pushRoleToUser,
//   deleteaUser,
//   updateaUser,
//   getPassword,
//   updatePassword,
// };

// const bcrypt = require("bcrypt");
// const jwttoken = require("jsonwebtoken");
// const { StatusCodes } = require("http-status-codes");
// const UserModel = require("../Models/UserModel");
// const asyncHandler = require("express-async-handler");
// const {
//   validateEmail,
//   validatePassword,
//   validatePhone,
// } = require("../Helpers/validationHelper");
// require("dotenv").config();

// const generateToken = (userId) =>
//   jwttoken.sign({ user_id: userId }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });

// const refreshToken = async (userId, token) =>
//   await UserModel.findByIdAndUpdate(userId, {
//     $set: { refreshToken: token },
//   }).lean();

// const createError = (statusCode, message) => {
//   throw Object.assign(new Error(message), { statusCode });
// };

// const determineRoleType = async () =>
//   (await UserModel.countDocuments({ roleType: "admin" })) === 0
//     ? "admin"
//     : "user";

// const validateFields = (fields) =>
//   Object.entries(fields).forEach(([field, value]) => {
//     if (!value)
//       throw createError(
//         StatusCodes.BAD_REQUEST,
//         `${field.replace("_", " ")} is required!`
//       );
//   });

// // Add this function to check user permissions
// const checkPermission = (userInfo, permissionType) => {
//   if (
//     userInfo.role[0] &&
//     userInfo.role[0].permissions[0].users[permissionType]
//   ) {
//     return true;
//   }
//   return false;
// };

// const extractUsername = (email) =>
//   email.split("@").length === 2 ? email.split("@")[0] : null;

// const createUser = asyncHandler(async (req, res) => {
//   const { email, password, firstName, lastName, contact } = req.body;
//   validateFields({ firstName, lastName, email, password, contact });
//   validateEmail(email);
//   validatePassword(password);
//   validatePhone(contact);

//   const roleType = await determineRoleType();
//   const encryptedPassword = await bcrypt.hash(password, 10);

//   const user = await UserModel.create({
//     firstName,
//     lastName,
//     userName: extractUsername(email),
//     email: email.toLowerCase(),
//     contact,
//     password: encryptedPassword,
//     roleType,
//     status: 1,
//   });

//   const token = generateToken(user._id);
//   await refreshToken(user._id, token);

//   res.status(StatusCodes.CREATED).send({
//     status: true,
//     message: "User is Registered Successfully! :)",
//     token,
//   });
// });

// const loginUserCtrl = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     throw createError(StatusCodes.BAD_REQUEST, "All the fields are required!");

//   const user = await UserModel.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password)))
//     throw createError(
//       StatusCodes.BAD_REQUEST,
//       "You have entered the wrong credentials!"
//     );

//   const token = generateToken(user._id);
//   await refreshToken(user._id, token);

//   res
//     .status(StatusCodes.OK)
//     .send({ status: true, message: "Login successfully! :)", token });
// });

// const getUserListQuery = (UserInfo) =>
//   UserInfo.roleType === "admin" ? {} : { _id: UserInfo._id };

// const getallUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   const getUsers = await UserModel.find(getUserListQuery(UserInfo))
//     .populate("role")
//     .select("-password")
//     .lean();
//   res.status(StatusCodes.OK).send({ status: true, data: getUsers });
// });

// const getoneUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   const user_Id = req.query.userId;
//   const getoneUser = await UserModel.findById(user_Id)
//     .populate("role")
//     .select("-password")
//     .lean();

//   if (UserInfo.roleType !== "admin" && UserInfo._id.toString() !== user_Id)
//     throw createError(StatusCodes.FORBIDDEN, "Access denied");

//   res.status(StatusCodes.OK).send({ status: true, data: getoneUser });
// });

// const pushRoleToUser = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   const { userId, roleId } = req.body;

//   if (UserInfo.roleType !== "admin")
//     throw createError(StatusCodes.FORBIDDEN, "Access denied");

//   await UserModel.findByIdAndUpdate(userId, { $set: { role: roleId } }).lean();

//   res.status(StatusCodes.OK).send({
//     status: true,
//     message: "Assign the role to user successfully! :)",
//   });
// });

// const updateaUser = asyncHandler(async (req, res) => {
//   const { userId } = req.query;
//   const UserInfo = req.userId;

//   if (UserInfo.roleType !== "admin" && UserInfo._id.toString() !== userId)
//     throw createError(StatusCodes.FORBIDDEN, "Access denied");

//   const updateaUser = await UserModel.findByIdAndUpdate(
//     userId,
//     { firstName: req?.body.firstname, lastName: req?.body.lastname },
//     { new: true }
//   ).lean();

//   res.status(StatusCodes.OK).send({
//     status: true,
//     message: "User Update successfully! :)",
//     data: updateaUser,
//   });
// });

// const deleteaUser = asyncHandler(async (req, res) => {
//   const { userId } = req.query;
//   const UserInfo = req.userId;

//   if (UserInfo.roleType !== "admin")
//     throw createError(StatusCodes.FORBIDDEN, "Access denied");

//   await UserModel.findByIdAndDelete(userId).lean();

//   res
//     .status(StatusCodes.OK)
//     .send({ status: true, message: "User delete successfully! :)" });
// });

// const getPassword = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   const user = await UserModel.findOne({ _id: UserInfo._id })
//     .select("password")
//     .lean();

//   res.status(StatusCodes.OK).send({ status: true, data: user });
// });

// const updatePassword = asyncHandler(async (req, res) => {
//   const UserInfo = req.userId;
//   const { oldpassword, newpassword, cpassword } = req.body;

//   if (UserInfo.roleType !== "admin" && UserInfo._id.toString() !== UserInfo._id)
//     throw createError(StatusCodes.FORBIDDEN, "Access denied");

//   if (!(newpassword && cpassword))
//     throw createError(StatusCodes.BAD_REQUEST, "All the fields are required!");

//   if (validatePassword(newpassword) == false)
//     throw createError(
//       StatusCodes.BAD_REQUEST,
//       "Password must have a minimum of 8 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character."
//     );

//   const user = await UserModel.findById(UserInfo._id).lean();
//   const mpassword = await bcrypt.compare(oldpassword, user.password);

//   if (!mpassword)
//     throw createError(
//       StatusCodes.BAD_REQUEST,
//       "You have entered the wrong password!"
//     );

//   if (newpassword !== cpassword)
//     throw createError(
//       StatusCodes.BAD_REQUEST,
//       "New password and Confirm password do not match! :)"
//     );

//   const encryptedPassword = await bcrypt.hash(newpassword, 10);
//   await UserModel.findByIdAndUpdate(UserInfo._id, {
//     $set: { password: encryptedPassword },
//   }).lean();

//   res
//     .status(StatusCodes.OK)
//     .send({ status: true, message: "Password has changed successfully! :)" });
// });

// module.exports = {
//   createUser,
//   loginUserCtrl,
//   getallUser,
//   getoneUser,
//   pushRoleToUser,
//   deleteaUser,
//   updateaUser,
//   getPassword,
//   updatePassword,
// };

const bcrypt = require("bcrypt");
const jwttoken = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const UserModel = require("../Models/UserModel");
const asyncHandler = require("express-async-handler");
const {
  validateEmail,
  validatePassword,
  validatePhone,
} = require("../Helpers/validationHelper");
require("dotenv").config();

const checkPermission = (userInfo, permissionType) =>
  userInfo.role[0] && userInfo.role[0].permissions[0].users[permissionType];

const generateToken = (userId) =>
  jwttoken.sign({ user_id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

const refreshToken = async (userId, token) =>
  await UserModel.findByIdAndUpdate(userId, {
    $set: { refreshToken: token },
  }).lean();

const createError = (statusCode, message) => {
  throw Object.assign(new Error(message), { statusCode });
};

const determineRoleType = async () =>
  (await UserModel.countDocuments({ roleType: "admin" })) === 0
    ? "admin"
    : "user";

const validateFields = (fields) =>
  Object.entries(fields).forEach(([field, value]) => {
    if (!value)
      throw createError(
        StatusCodes.BAD_REQUEST,
        `${field.replace("_", " ")} is required!`
      );
  });

const extractUsername = (email) =>
  email.split("@").length === 2 ? email.split("@")[0] : null;

const createUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, firstName, lastName, contact } = req.body;

    validateFields({ firstName, lastName, email, password, contact });
    validateEmail(email);
    validatePassword(password);
    validatePhone(contact);

    const roleType = await determineRoleType();

    const encryptedPassword = await bcrypt.hash(password, 10);

    if (await UserModel.exists({ email })) {
      throw createError(
        StatusCodes.CONFLICT,
        `User with email: ${email} already exists!`
      );
    }

    const { _id: userId } = await UserModel.create({
      firstName: firstName,
      lastName: lastName,
      userName: extractUsername(email),
      email: email.toLowerCase(),
      contact: contact,
      password: encryptedPassword,
      roleType,
      status: 1,
    });

    const token = generateToken(userId);

    await UserModel.findByIdAndUpdate(userId, {
      $set: { refreshToken: token },
    });

    res.status(StatusCodes.CREATED).send({
      status: true,
      message: "User is Registered Successfully! :)",
      token,
    });
  } catch (err) {
    const status = err.statusCode || StatusCodes.BAD_REQUEST;
    res.status(status).send({ status: false, message: err.message });
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      console.log(email, password)
      throw createError(
        StatusCodes.BAD_REQUEST,
        "All the fields are required!"
      );
    }

    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createError(
        StatusCodes.BAD_REQUEST,
        "You have entered the wrong credentials!"
      );
    }

    const token = jwttoken.sign(
      { user_id: user._id, urole: user.roleType, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );

    await UserModel.findByIdAndUpdate(user._id, {
      $set: { refreshToken: token },
    });

    res.status(StatusCodes.OK).send({
      status: true,
      message: "Login successfully! :)",
      token,
    });
  } catch (err) {
    const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).send({ status: false, message: err.message });
  }
});

const getallUser = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const canReadUsers = checkPermission(userInfo, "read");

    if (isAdmin || canReadUsers) {
      const getUsers = await UserModel.find()
        .populate("role")
        .select("-password");
      return res.status(StatusCodes.OK).send({ status: true, data: getUsers });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const getoneUser = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const user_Id = req.query.userId;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const isSelf = userInfo._id.toString() === user_Id;

    if (isAdmin || isSelf) {
      const getOneUser = await UserModel.findById(user_Id)
        .populate("role")
        .select("-password")
        .lean();
      return res
        .status(StatusCodes.OK)
        .send({ status: true, data: getOneUser });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const pushRoleToUser = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const canUpdateUsers = checkPermission(userInfo, "update");

    if (isAdmin || canUpdateUsers) {
      const { userId, roleId } = req.body;
      await UserModel.findByIdAndUpdate(userId, {
        $set: { role: roleId },
      }).lean();
      return res.status(StatusCodes.OK).send({
        status: true,
        message: "Assign the role to user successfully! :)",
      });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const updateaUser = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const userId = req.query.userId;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const isSelf = userInfo._id.toString() === userId;

    if (isAdmin || isSelf) {
      const updateOneUser = await UserModel.findByIdAndUpdate(
        userId,
        { firstName: req?.body.firstname, lastName: req?.body.lastname },
        { new: true }
      ).lean();
      return res.status(StatusCodes.OK).send({
        status: true,
        message: "User Update successfully! :)",
        data: updateOneUser,
      });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const deleteaUser = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const userIdToDelete = req.query.userId;

  try {
    const isAdmin = userInfo.roleType === "admin";
    const canDeleteUsers = checkPermission(userInfo, "delete");
    const isUserToDeleteSelf = userInfo._id.toString() === userIdToDelete;

    // Check if the user to be deleted has roleType "admin"
    const userToDelete = await UserModel.findById(userIdToDelete).lean();
    const isUserToDeleteAdmin = userToDelete.roleType === "admin";

    if (
      isAdmin ||
      (canDeleteUsers && !isUserToDeleteSelf && !isUserToDeleteAdmin)
    ) {
      // Additional check to ensure users cannot delete themselves or admins
      if (isUserToDeleteSelf) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send({ status: false, message: "You cannot delete yourself" });
      }

      if (isUserToDeleteAdmin) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .send({
            status: false,
            message: "Cannot delete a user with roleType 'admin'",
          });
      }

      await UserModel.findByIdAndDelete(userIdToDelete).lean();
      return res.status(StatusCodes.OK).send({
        status: true,
        message: "User deleted successfully! :)",
      });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const getPassword = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const userID = userInfo._id;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const isSelf = userInfo._id.toString() === userID;

    if (isAdmin || isSelf) {
      const user = await UserModel.findOne({ _id: userID }).select("password");
      return res.status(StatusCodes.OK).send({ status: true, data: user });
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  try {
    const isAdmin = userInfo.roleType === "admin";
    const isSelf = userInfo._id.toString() === userInfo._id;

    if (isAdmin || isSelf) {
      const { oldpassword, newpassword, cpassword } = req.body;

      if (!(newpassword && cpassword)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .send({ status: false, message: "All the fields are required!" });
      } else if (validatePassword(newpassword) == false) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          status: false,
          message:
            "Password must have a minimum of 8 characters with at least one uppercase letter, one lowercase letter, one digit, and one special character.",
        });
      } else {
        const user = await UserModel.findById({ _id: userInfo._id }).lean();
        const isMatch = await bcrypt.compare(oldpassword, user.password);

        if (isMatch) {
          if (newpassword === cpassword) {
            const encryptedPassword = await bcrypt.hash(newpassword, 10);
            await UserModel.findByIdAndUpdate(
              { _id: userInfo._id },
              { $set: { password: encryptedPassword } }
            ).lean();
            return res.status(StatusCodes.OK).send({
              status: true,
              message: "Password has changed successfully! :)",
            });
          } else {
            return res.status(StatusCodes.BAD_REQUEST).send({
              status: false,
              message: "New password and Confirm password do not match! :)",
            });
          }
        } else {
          return res.status(StatusCodes.BAD_REQUEST).send({
            status: false,
            message: "You have entered the wrong password!",
          });
        }
      }
    } else {
      return res
        .status(StatusCodes.FORBIDDEN)
        .send({ status: false, message: "Access denied" });
    }
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ status: false, message: err.message });
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getoneUser,
  pushRoleToUser,
  deleteaUser,
  updateaUser,
  getPassword,
  updatePassword,
};
