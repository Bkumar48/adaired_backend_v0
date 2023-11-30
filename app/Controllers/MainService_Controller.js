/**
 * @file MainService_Controller.js
 * @description This file contains the controller functions for handling MainService related operations in a Node.js/Express application.
 * It includes functions for creating, retrieving, updating, and deleting MainService records, with associated permissions and file uploads.
 * @version 1.0
 * @last_modified November 28, 2023
 */

const MainService = require("../Models/MainService_Model");
const asyncHandler = require("express-async-handler");
const { mainServiceImg } = require("../Middleware/fileUpload");
const uploadPath =
  process.env.UPLOAD_MAIN_SERVICE || "public/images/mainService/";
const fs = require("fs").promises;

/**
 * @function checkPermission
 * @description Checks if a user has the required permissions for a specific entity and action.
 * @param {Object} userInfo - The user information object.
 * @param {string} entity - The entity for which permissions are checked.
 * @param {string} action - The action for which permissions are checked.
 * @returns {boolean} - Returns true if the user has permission, false otherwise.
 */
const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

/**
 * @function handlePermission
 * @description Handles the permission checks and error handling for specific operations.
 * @param {string} entity - The entity for which permissions are checked.
 * @param {string} action - The action for which permissions are checked.
 * @param {Function} uploadMiddleWare - The middleware function for file uploads.
 * @param {Function} operation - The operation to be performed after permission checks.
 * @returns {Function} - Returns an Express middleware function.
 */
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

/**
 * @function performOperation
 * @description Calls the provided model method with the given arguments.
 * @param {Function} modelMethod - The model method to be called.
 * @param  {...any} args - The arguments to be passed to the model method.
 * @returns {Promise} - Returns the result of the model method.
 */
const performOperation = async (modelMethod, ...args) => modelMethod(...args);

/**
 * @function setImageFields
 * @description Sets image fields in the MainService document based on uploaded files.
 * @param {Object} req - The Express request object.
 * @param {Object} mainService - The MainService document.
 * @returns {Promise} - Resolves once image fields are set and the document is saved.
 */
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

/**
 * @function deleteFile
 * @description Deletes a file at the specified path.
 * @param {string} filePath - The path of the file to be deleted.
 * @returns {Promise} - Resolves once the file is deleted or rejects with an error.
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

/**
 * @function createNewMainService
 * @description Creates a new MainService record.
 * @route {POST} /api/mainService
 * @access Private
 */
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

/**
 * @function getAllMainServices
 * @description Retrieves all MainService records.
 * @route {GET} /api/mainService
 * @access Public
 */
const getAllMainServices = asyncHandler(async (req, res) => {
  const mainServices = await performOperation(
    MainService.find.bind(MainService)
  );
  res.status(200).json({
    data: mainServices,
  });
});

/**
 * @function getMainServiceById
 * @description Retrieves a single MainService record by ID.
 * @route {GET} /api/mainService/:id
 * @access Public
 */
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

/**
 * @function updateMainService
 * @description Updates a MainService record by ID.
 * @route {PUT} /api/mainService/:id
 * @access Private
 */
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

/**
 * @function deleteMainService
 * @description Deletes a MainService record by ID.
 * @route {DELETE} /api/mainService/:id
 * @access Private
 */
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
