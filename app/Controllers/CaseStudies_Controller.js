const CaseStudy = require("../Models/CaseStudies_Model");
const { ObjectId } = require("mongoose").Types;
const asyncHandler = require("express-async-handler");
const { caseStudyImg } = require("../Middleware/fileUpload");
const uploadPath = process.env.UPLOAD_CASE_STUDY;
const slugify = require("slugify");
const fs = require("fs").promises;
const { StatusCodes } = require("http-status-codes");

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

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

const performOperation = async (modelMethod, ...args) => modelMethod(...args);

const setImageFields = async (req, CaseStudy) => {
  const imageFields = [
    "cardImage",
    "caseStudyImage",
    "challengesImage",
    "solutionsImage",
    "goalImage",
    "resultBox",
  ];

  await Promise.all(
    imageFields.map(async (field) => {
      if (req.files?.length) {
        if (field === "resultBox") {
          for (let i = 0; i < CaseStudy[field].length; i++) {
            const resultbox = CaseStudy[field][i];

            // Remove Keys with empty objects as values
            const filterLastSectionPointsObj = Object.fromEntries(
              Object.entries(resultbox).filter(
                ([key, value]) => !isEmptyObject(value)
              )
            );

            function isEmptyObject(obj) {
              return (
                Object.keys(obj).length === 0 && obj.constructor === Object
              );
            }

            filterLastSectionPointsObj.icon = "";
            CaseStudy[field][i] = filterLastSectionPointsObj;

            const file = req.files.find(
              (file) => file.fieldname === `resultBox[` + i + `][image]`
            );

            if (file) {
              CaseStudy[field][i].icon = `${uploadPath}${file.filename}`;
            }
          }
        } else {
          const file = req.files.find((file) => file.fieldname === field);
          if (file) CaseStudy[field] = `${uploadPath}${file.filename}`;
        }
      }
    })
  );
};

const deletePreviousImages = async (previousImages) => {
  try {
    await Promise.all(
      previousImages.map(async (prevImg) => {
        // Construct the path of the previous image and delete it
        const path = `${prevImg}`;
        await fs.unlink(path);
      })
    );
  } catch (error) {
    console.error(error);
  }
};

// Function to get the previous images from the caseStudy object
const getPreviousImages = (caseStudy) => {
  const previousImages = [];
  const imageFields = [
    "cardImage",
    "caseStudyImage",
    "challengesImage",
    "solutionsImage",
    "goalImage",
    "resultBox",
  ];

  imageFields.forEach((field) => {
    if (Array.isArray(caseStudy[field])) {
      caseStudy[field].forEach((resultbox) => {
        if (resultbox.icon) {
          previousImages.push(resultbox.icon);
        }
      });
    } else if (caseStudy[field]) {
      previousImages.push(caseStudy[field]);
    }
  });

  return previousImages;
};

const createCaseStudy = handlePermission(
  "caseStudy",
  "create",
  caseStudyImg,
  async (req, res) => {
    const { caseStudyName } = req.body;
    req.body.slug = slugify(req.body.slug || caseStudyName, { lower: true });

    const caseStudy = await performOperation(
      CaseStudy.create.bind(CaseStudy),
      req.body
    );

    await setImageFields(req, caseStudy);

    await caseStudy.save();
    return caseStudy;
  }
);

const updateCaseStudy = handlePermission(
  "caseStudy",
  "update",
  caseStudyImg,
  async (req, res) => {
    const { name } = req.body;
    req.body.slug = slugify(req.body.slug || name, { lower: true });

    const caseStudy = await performOperation(
      CaseStudy.findOne.bind(CaseStudy),
      { slug: req.params.slug }
    );

    if (!caseStudy) {
      return null;
    }

    // Check if new images are uploaded
    const newImagesUploaded = req.files && req.files.length > 0;

    // Get the previous images before updating
    const previousImages = getPreviousImages(caseStudy);

    // Update caseStudy fields with new values
    Object.assign(caseStudy, req.body);

    // If new images are uploaded, update image fields and delete previous images
    if (newImagesUploaded) {
      await setImageFields(req, caseStudy);
      await deletePreviousImages(previousImages);
    }

    // Save the updated case study
    await caseStudy.save();
    return caseStudy;
  }
);

const getCaseStudy = async (req, res) => {
  const { slug } = req.params;
  const { category } = req.query;

  try {
    if (slug === "all") {
      // Check if a category is specified in the query
      if (category) {
        const caseStudies = await CaseStudy.find({ category: category });
        return res.status(StatusCodes.OK).json({ result: caseStudies });
      } else {
        const caseStudies = await CaseStudy.find();
        return res.status(StatusCodes.OK).json({ result: caseStudies });
      }
    }

    const query = { slug };

    // If a category is specified in the query, add it to the query
    if (category) {
      query.categories = category;
    }

    const caseStudy = await CaseStudy.findOne(query);

    if (!caseStudy) {
      return res
        .status(404)
        .json({ error: "Case study with this slug not found" });
    }

    return res.status(200).json({ result: caseStudy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCaseStudy = handlePermission(
  "caseStudy",
  "delete",
  caseStudyImg, // Assuming you want to use the same upload middleware for deletion
  async (req, res) => {
    const { slug } = req.params;

    const caseStudy = await performOperation(
      CaseStudy.findOne.bind(CaseStudy),
      { slug }
    );

    if (!caseStudy) {
      return res
        .status(404)
        .json({ error: "Case study with this slug not found" });
    }

    // Get the previous images before deleting
    const previousImages = getPreviousImages(caseStudy);

    try {
      // Delete the case study document
      await caseStudy.remove();

      // Delete the associated images
      await deletePreviousImages(previousImages);

      return res
        .status(200)
        .json({ result: "Case study deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }
);

module.exports = {
  createCaseStudy,
  getCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
};
