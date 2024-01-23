// Import required modules and dependencies
const Service = require("../Models/Service_Model");
const { ObjectId } = require("mongoose").Types;
const asyncHandler = require("express-async-handler");
const { ServiceImg } = require("../Middleware/fileUpload");
const uploadPath = process.env.UPLOAD_SERVICE;
const fs = require("fs").promises;
const slugify = require("slugify");

/**
 * Check if the user has permission to perform a specific action on an entity.
 *
 * @param {Object} userInfo - User information object.
 * @param {string} entity - Entity name (e.g., "Service").
 * @param {string} action - Action to be performed (e.g., "create", "update", "delete").
 * @returns {boolean} - Indicates whether the user has permission.
 */
const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

/**
 * Middleware to handle permissions and execute operations.
 *
 * @param {string} entity - Entity name (e.g., "Service").
 * @param {string} action - Action to be performed (e.g., "create", "update", "delete").
 * @param {Function} uploadMiddleware - File upload middleware specific to the operation.
 * @param {Function} operation - Asynchronous function representing the main operation.
 * @returns {Function} - Express middleware function.
 */
const handlePermission = (entity, action, uploadMiddleware, operation) =>
  asyncHandler(async (req, res, next) => {
    const { userId } = req;

    if (!checkPermission(userId, entity, action)) {
      res
        .status(403)
        .json({ error: "You are not allowed to perform this action" });
    }

    try {
      await uploadMiddleware(req, res, async (err) => {
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
 * Execute a Mongoose model method with the provided arguments.
 *
 * @param {Function} modelMethod - Mongoose model method to be executed.
 * @param {...any} args - Additional arguments to be passed to the model method.
 * @returns {any} - Result of the executed model method.
 */

const performOperation = async (modelMethod, ...args) => modelMethod(...args);
/**
 * Set image fields in the Service document based on uploaded files.
 *
 * @param {Object} req - Express request object.
 * @param {Object} Service - Service model instance.
 * @returns {void}
 */

const setImageFields = async (req, Service) => {
  const imageFields = [
    "serviceImage",
    "ourProcessImageI",
    "ourProcessImageII",
    "combinedSection",
    "LastSectionPoints",
    "LastSectionImage",
  ];

  await Promise.all(
    imageFields.map(async (field) => {
      if (req.files?.length) {
        if (field === "combinedSection" && Array.isArray(Service[field])) {
          // Handle an array of combinedSectionImage objects
          for (let i = 0; i < Service[field].length; i++) {
            const combinedImageObj = Service[field][i];

            // Remove keys with empty objects as values
            const filterCombinedImageObj = Object.fromEntries(
              Object.entries(combinedImageObj).filter(
                ([key, value]) => !isEmptyObject(value)
              )
            );

            function isEmptyObject(obj) {
              return (
                Object.keys(obj).length === 0 && obj.constructor === Object
              );
            }

            filterCombinedImageObj.combinedSectionImage = "";
            Service[field][i] = filterCombinedImageObj;

            const file = req.files.find(
              (file) =>
                file.fieldname ===
                "combinedSection[" + [i] + "][combinedSectionImage]"
            );

            if (file) {
              if (Service[field][i].combinedSectionImage) {
                await deleteFile(
                  uploadPath + Service[field][i].combinedSectionImage
                );
              }
            }

            file
              ? (Service[field][i].combinedSectionImage = file.filename)
              : "";
          }
        } else if (
          field === "LastSectionPoints" &&
          Array.isArray(Service[field])
        ) {
          // Handle an array of LastSectionPoints objects
          for (let i = 0; i < Service[field].length; i++) {
            const LastSectionPointsObj = Service[field][i];

            // Remove keys with empty objects as values
            const filterLastSectionPointsObj = Object.fromEntries(
              Object.entries(LastSectionPointsObj).filter(
                ([key, value]) => !isEmptyObject(value)
              )
            );

            function isEmptyObject(obj) {
              return (
                Object.keys(obj).length === 0 && obj.constructor === Object
              );
            }

            filterLastSectionPointsObj.LastSectionPointsImage = "";
            Service[field][i] = filterLastSectionPointsObj;

            const file = req.files.find(
              (file) =>
                file.fieldname === "LastSectionPoints[" + [i] + "][icon]"
            );

            if (file) {
              if (Service[field][i].LastSectionPointsImage) {
                await deleteFile(
                  uploadPath + Service[field][i].LastSectionPointsImage
                );
              }
            }

            file
              ? (Service[field][i].LastSectionPointsImage = file.filename)
              : "";
          }
        } else {
          const file = req.files.find((file) => file.fieldname === field);

          if (file) {
            if (Service[field]) {
              await deleteFile(uploadPath + Service[field]);
            }
            Service[field] = file.filename;
          }
        }
      }
    })
  );

  // Save the modified document
  await Service.save();
};

/**
 * Delete a file from the file system.
 *
 * @param {string} filePath - Path to the file to be deleted.
 * @returns {void}
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

/**
 * Middleware to create a new service with permission checks and image handling.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Created service.
 */

const createNewService = handlePermission(
  "Service",
  "create",
  ServiceImg,
  async (req, res) => {
    try {
      const parentId = req.body.parentId;
      const isChildService = req.body.isChildService;

      // Slugify the provided slug (assuming it's in req.body.slug)
      req.body.slug = slugify(req.body.slug, { lower: true });

      // Create the new service
      const createdService = await performOperation(
        Service.create.bind(Service),
        req.body
      );

      await setImageFields(req, createdService);

      if (isChildService && parentId) {
        // If it's a child service, set the parent's title as the serviceBanner
        const parentService = await Service.findById(parentId);

        if (!parentService) {
          // If parent does not exist, throw an error and remove the created service
          throw new Error("Parent does not exist.");
        }

        createdService.serviceBanner = parentService.serviceBanner;

        // Update the parent's children array with the new service ID
        parentService.childrens.push(createdService.slug);
        await parentService.save();
      }

      await createdService.save();

      return createdService;
    } catch (error) {
      console.log("Error in createNewService:", error);

      // If there's an error, you might want to remove the created service
      if (Service) {
        await Service.findByIdAndRemove(Service._id);
      }
    }
  }
);

/**
 * Retrieve services based on route parameters.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const getServices = asyncHandler(async (req, res) => {
  const { id, slug, parentSlug } = req.params;
  const { allParent, allChild } = req.query;

  try {
    let query = {};

    if (slug) {
      // Find a service by slug
      query = { slug: slug };
    } else if (parentSlug && slug) {
      // Find a child service by parent and child slugs
      const parentService = await performOperation(
        Service.findOne.bind(Service),
        { slug: parentSlug, isChildService: false }
      );

      if (parentService) {
        query = {
          parentId: parentService._id,
          slug: slug,
          isChildService: true,
        };
      } else {
        return res.status(404).json({ error: "Parent Service not found" });
      }
    } else if (id) {
      console.log("Service ID:", id);
      console.log("Type of Service ID:", typeof id);

      // Check if id is a valid ObjectId
      try {
        const objectId = ObjectId(id);
        console.log("Converted ObjectId:", objectId);
      } catch (objectIdError) {
        console.error("Error converting to ObjectId:", objectIdError);
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Find a service by ID
      query = { _id: ObjectId(id) };
    } else if (allParent) {
      // Find all parent services
      query = { isChildService: false };
    } else if (allChild) {
      // Find all child services
      query = { isChildService: true };
    } else {
      query = {};
      // Fetch all services if no specific parameters are provided
      const Services = await performOperation(Service.find.bind(Service));
      return res.status(200).json({
        data: Services,
      });
    }
    const Services = await performOperation(Service.find.bind(Service), query);

    Services.length === 0
      ? res.status(404).json({ error: "No Services Found" })
      : res.status(200).json({ data: Services });
  } catch (error) {
    console.error("Error in getServices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Middleware to update an existing service with permission checks and image handling.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Updated service.
 */
const updateService = handlePermission(
  "Service",
  "update",
  ServiceImg,
  async (req, res) => {
    const { serviceId } = req.params;

    try {
      // Find the service by ID
      const service = await performOperation(
        Service.findById.bind(Service),
        serviceId
      );

      if (!service) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Service not found" });
      }

      // Update the service properties
      Object.assign(service, req.body);

      // Handle image fields
      await setImageFields(req, service);

      // Save the updated document
      await service.save();

      return service;
    } catch (error) {
      console.error("Error in updateService:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
);

/**
 * Middleware to delete a service and associated images with permission checks.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Object indicating success message.
 */
const deleteService = handlePermission(
  "Service",
  "delete",
  (req, res, next) => next(), // No upload middleware for deletion
  async (req, res) => {
    const { serviceId } = req.params;

    try {
      // Find the service by ID
      const service = await performOperation(
        Service.findById.bind(Service),
        serviceId
      );

      if (!service) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Service not found" });
      }

      // Delete the associated image files
      const imageFields = [
        "serviceImage",
        "ourProcessImageI",
        "ourProcessImageII",
        "leftImage",
        "rightImage",
        "LastSectionImage",
      ];

      const deleteImagePromises = imageFields.map(async (field) => {
        if (service[field]) {
          await deleteFile(`${uploadPath}/${service[field]}`);
        }
      });

      await Promise.all(deleteImagePromises);

      // Remove the service from its parent's children array
      if (service.parentId) {
        const parentService = await Service.findById(service.parentId);
        if (parentService) {
          parentService.childrens = parentService.childrens.filter(
            (childId) => childId.toString() !== serviceId
          );
          await parentService.save();
        }
      }

      // Delete the service
      await performOperation(
        Service.findByIdAndRemove.bind(Service),
        serviceId
      );

      return { message: "Service and associated images deleted successfully" };
    } catch (error) {
      console.error("Error in deleteService:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error" });
    }
  }
);

// Export the controller functions for use in Express routes
module.exports = {
  createNewService,
  getServices,
  updateService,
  deleteService,
};
