// MainService_Controller.js
const MainService = require("../Models/MainService_Model");
const asyncHandler = require("express-async-handler");
const { mainServiceImg } = require("../Middleware/fileUpload");
const fs = require("fs").promises;
const uploadPath =
  process.env.UPLOAD_MAIN_SERVICE || "public/images/mainService/";
// @desc    Check Permissions
const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, uploadMiddleWare, operation) =>
  asyncHandler(async (req, res, next) => {
    const { userId } = req;

    if (!checkPermission(userId, entity, action)) {
      res
        .status(403)
        .json({ error: "You are not allowed to perform this action" });
    }

    try {
      await uploadMiddleWare(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }
        const result = await operation(req, res, next);
        const status = result ? 200 : 404;
        res.status(status).json(result ? { result } : { error: "Not Found" });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

const performOperation = async (modelMethod, ...args) => modelMethod(...args);

const setImageFields = async (req, mainService) => {
  const imageFields = [
    "serviceImage",
    "ourProcessImageI",
    "ourProcessImageII",
    "leftImage",
    "rightImage",
    "LastSectionImage",
  ];

  imageFields.forEach(async (field) => {
    if (req.files?.length) {
      const file = req.files.find((file) => file.fieldname === field);
      if (file) {
        if (mainService[field]) {
          await deleteFile(uploadPath + mainService[field]);
        }
        mainService[field] = file.filename;
      }
    }
  });

  // Save the modified document
  await mainService.save();
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

// @desc    Create new mainService
// @route   POST /api/mainService
// @access  Private

const createNewMainService = handlePermission(
  "mainService",
  "create",
  mainServiceImg,
  async (req, res) => {
    const mainService = await performOperation(
      MainService.create.bind(MainService),
      req.body
    );
    await setImageFields(req, mainService);
    await mainService.save();
    return mainService;
  }
);

// @desc    Get all main services
// @route   GET /api/mainService
// @access  Public

const getAllMainServices = asyncHandler(async (req, res) => {
  const mainServices = await performOperation(
    MainService.find.bind(MainService)
  );
  res.status(200).json(mainServices);
});

// @desc    Get single main service by ID
// @route   GET /api/mainService/:id
// @access  Public

const getMainServiceById = asyncHandler(async (req, res) => {
  const mainService = await performOperation(
    MainService.findById.bind(MainService),
    req.params.id
  );

  if (mainService) {
    res.status(200).json(mainService);
  } else {
    res.status(404).json({ error: "Main service not found" });
  }
});

// @desc    Update main service by ID
// @route   PUT /api/mainService/:id
// @access  Private

const updateMainService = handlePermission(
  "mainService",
  "update",
  mainServiceImg,
  async (req, res) => {
    const mainService = await performOperation(
      MainService.findById.bind(MainService),
      req.params.id
    );

    if (!mainService) {
      return res.status(404).json({ error: "Main service not found" });
    }

    mainService.set(req.body);
    await setImageFields(req, mainService);
    await mainService.save();

    return mainService;
  }
);

// @desc    Delete main service by ID
// @route   DELETE /api/mainService/:id
// @access  Private

// const deleteMainService = handlePermission(
//   "mainService",
//   "delete",
//   (req, res, next) => next(),
//   async (req, res) => {
//     try {
//       const mainService = await performOperation(
//         MainService.findByIdAndDelete.bind(MainService),
//         req.params.id
//       );

//       if (mainService) {
//         const imageFields = [
//           mainService.serviceImage,
//           mainService.ourProcessImageI,
//           mainService.ourProcessImageII,
//           mainService.leftImage,
//           mainService.rightImage,
//           mainService.LastSectionImage,
//         ];

//         for (const imageField of imageFields) {
//           console.log("Image Field :", imageField)
//           if (imageField) {
//             await deleteFile(uploadPath + imageField);
//           }
//         }

//         res
//           .status(200)
//           .json({
//             success: true,
//             message: "Main Service deleted successfully",
//           });
//       } else {
//         res.status(404).json({ error: "Main service not found" });
//       }
//     } catch (error) {
//       console.error("Error in deleteMainService:", error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// );

// @desc    Delete main service by ID
// @route   DELETE /api/mainService/:id
// @access  Private

const deleteMainService = handlePermission(
  "mainService",
  "delete",
  (req, res, next) => next(), // Placeholder function for delete operation
  async (req, res) => {
    try {
      const mainService = await performOperation(
        MainService.findByIdAndDelete.bind(MainService),
        req.params.id
      );

      if (mainService) {
        const imageFields = [
          mainService.serviceImage,
          mainService.ourProcessImageI,
          mainService.ourProcessImageII,
          mainService.leftImage,
          mainService.rightImage,
          mainService.LastSectionImage,
        ];

        for (const imageField of imageFields) {
          if (imageField) {
            await deleteFile(uploadPath + imageField);
          }
        }

        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Main service not found" });
      }
    } catch (error) {
      console.error("Error in deleteMainService:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = {
  createNewMainService,
  getAllMainServices,
  getMainServiceById,
  updateMainService,
  deleteMainService,
};

module.exports = {
  createNewMainService,
  getAllMainServices,
  getMainServiceById,
  updateMainService,
  deleteMainService,
};
