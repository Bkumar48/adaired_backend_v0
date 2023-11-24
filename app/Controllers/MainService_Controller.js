// // MainService_Controller.js
// const MainService = require("../Models/MainService_Model");
// const asyncHandler = require("express-async-handler");
// const { upload } = require("../Middleware/fileUpload");
// const { mainServiceImg } = require("../Middleware/fileUpload");
// const fs = require("fs");

// const checkPermission = (userInfo, entity, action) =>
//   userInfo?.roleType === "admin" ||
//   userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

// const handlePermission = (entity, action, operation) =>
//   asyncHandler(async (req, res) => {
//     const { userId } = req;

//     if (!checkPermission(userId, entity, action)) {
//       return res.status(403).json({ error: "Permission denied." });
//     }

//     try {
//       const result = await operation(req);
//       const status = result ? 200 : 404;
//       res
//         .status(status)
//         .json(result ? { result } : { error: "Resource not found" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   });

// const performOperation = async (modelMethod, ...args) => modelMethod(...args);

// const createNewMainService = handlePermission(
//   "mainService",
//   "create",
//   async (req) =>
//     performOperation(MainService.create.bind(MainService), req.body)
// );

// const getAllMainServices = handlePermission("mainService", "read", async () =>
//   performOperation(MainService.find.bind(MainService))
// );

// const getSingleMainService = handlePermission(
//   "mainService",
//   "read",
//   async (req) =>
//     performOperation(MainService.findById.bind(MainService), req.params.id)
// );

// const updateMainService = handlePermission(
//   "mainService",
//   "update",
//   async (req) =>
//     performOperation(
//       MainService.findByIdAndUpdate.bind(MainService),
//       req.params.id,
//       req.body,
//       { new: true }
//     )
// );

// const deleteMainService = handlePermission(
//   "mainService",
//   "delete",
//   async (req) =>
//     performOperation(
//       MainService.findByIdAndRemove.bind(MainService),
//       req.params.id
//     )
// );

// module.exports = {
//   createNewMainService,
//   getAllMainServices,
//   getSingleMainService,
//   updateMainService,
//   deleteMainService,
// };


// MainService_Controller.js
const MainService = require("../Models/MainService_Model");
const asyncHandler = require("express-async-handler");
const { mainServiceImg } = require("../Middleware/fileUpload");
const fs = require("fs");

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, operation) =>
  asyncHandler(async (req, res) => {
    const { userId } = req;

    if (!checkPermission(userId, entity, action)) {
      return res.status(403).json({ error: "Permission denied." });
    }

    try {
      const result = await operation(req);
      const status = result ? 200 : 404;
      res
        .status(status)
        .json(result ? { result } : { error: "Resource not found" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

const performOperation = async (modelMethod, ...args) =>
  modelMethod(...args);

const setImageFields = (req, document) => {
  const imageFields = [
    'serviceImage',
    // Add other image fields here
  ];

  imageFields.forEach((field) => {
    if (req.file && req.file.fieldname === field) {
      document[field] = req.file.filename;
    }
  });
};

const createNewMainService = handlePermission(
  "mainService",
  "create",
  async (req) => {
    const newMainService = new MainService(req.body);
    setImageFields(req, newMainService);

    await newMainService.save();
    return newMainService;
  }
);

const getAllMainServices = handlePermission("mainService", "read", async () =>
  performOperation(MainService.find.bind(MainService))
);

const getSingleMainService = handlePermission(
  "mainService",
  "read",
  async (req) =>
    performOperation(MainService.findById.bind(MainService), req.params.id)
);

const updateMainService = handlePermission(
  "mainService",
  "update",
  async (req) => {
    const updatedMainService = await MainService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    setImageFields(req, updatedMainService);

    await updatedMainService.save();
    return updatedMainService;
  }
);

const deleteMainService = handlePermission(
  "mainService",
  "delete",
  async (req) =>
    performOperation(
      MainService.findByIdAndRemove.bind(MainService),
      req.params.id
    )
);

module.exports = {
  createNewMainService,
  getAllMainServices,
  getSingleMainService,
  updateMainService,
  deleteMainService,
};
