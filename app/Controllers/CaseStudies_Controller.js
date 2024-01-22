const CaseStudy = require("../Models/CaseStudies_Model");
const { ObjectId } = require("mongoose").Types;
const asyncHandler = require("express-async-handler");
const { caseStudyImg } = require("../Middleware/fileUpload");
const uploadPath = process.env.UPLOAD_CASE_STUDY;
const slugify = require("slugify");
const fs = require("fs").promises;

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
    "caseStudyImage",
    "challengesImage",
    "solutionsImage",
    "goalImage",
    "resultBox",
  ];

  await Promise.all(
    imageFields.map(async (field) => {
      if (req.files?.length) {
        const file = req.files.find((file) => file.fieldname === field);
        if (file) {
          if(field === "resultBox"){
            const resultBox = req.files.map((file, index) => ({
              image: `${uploadPath}${file.filename}`,
              title: req.body.resultBox[index].title,
              percentage: req.body.resultBox[index].percentage,
              description: req.body.resultBox[index].description,
            }));
            CaseStudy[field] = resultBox;
          }
          else{
            CaseStudy[field] = `${uploadPath}${file.filename}`;
          }
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

module.exports = {
  createCaseStudy,
};
