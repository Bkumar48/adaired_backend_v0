const slugify = require("slugify");
const fs = require("fs").promises;
const { ObjectId } = require("mongoose").Types;
const asyncHandler = require("express-async-handler");
const CaseStudiesCategories = require("../Models/CaseStudiesCategories_Model");
const { caseStudiesCategoryImg } = require("../Middleware/fileUpload");
const uploadPath = process.env.UPLOAD_CASESTUDY_CATEGORY;
const { StatusCodes } = require("http-status-codes"); // Import StatusCodes from http-status-codes

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, uploadMiddleware, operation) => 
  asyncHandler(async (req, res, next) => {
    const { userId } = req;
    console.log("userId", userId);

    if (!checkPermission(userId, entity, action)) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You are not allowed to perform this action" });
    }

    try {
      await uploadMiddleware(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: err.message,
          });
        }
        const result = await operation(req, res, next);
        const status = result ? StatusCodes.OK : StatusCodes.NOT_FOUND;
        res.status(status).json(result ? { result } : { error: "Not Found" });
      });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  });

const performOperation = async (modelMethod, ...args) => modelMethod(...args);

const setImageFields = async (req, Category) => {
  const imageFields = ["technologies"];

  await Promise.all(
    imageFields.map(async (field) => {
      if (req.files?.length) {
        if (field === "technologies") {
          const technologies = req.files.map((file, index) => ({
            icon: `${uploadPath}${file.filename}`,
            title: req.body.technologies[index].title,
          }));
          Category[field] = technologies;
        }
      }
    })
  );
};

const deletePreviousImages = async (previousTechnologies) => {
  try {
    await Promise.all(
      previousTechnologies.map(async (prevTech) => {
        // Construct the path of the previous image and delete it
        const imagePath = `${prevTech.image}`;
        await fs.unlink(imagePath);
      })
    );
  } catch (error) {
    console.error("Error deleting previous images:", error);
  }
};


const createCaseStudiesCategory = handlePermission(
  "caseStudiesCategory",
  "create",
  caseStudiesCategoryImg,
  async (req, res) => {
    const { categoryName, childrens } = req.body;
    let slug = slugify(req.body.slug || categoryName, { lower: true });

    // Check if childrens is provided in req.body, otherwise default to an empty array
    req.body.childrens = childrens || [];

    // Check for duplicate slugs
    let isDuplicateSlug = await CaseStudiesCategories.exists({ slug: slug });
    if (isDuplicateSlug) {
      return res.status(400).json({ error: 'Duplicate slug' });
    }

    // Create the category
    const Category = new CaseStudiesCategories({
      categoryName: categoryName,
      slug: slug,
      childrens: req.body.childrens
    });

    // Set image fields
    await setImageFields(req, Category);

    try {
      // Save the category
      await Category.save();
      return res.status(200).json({ message: 'Category created successfully', category: Category });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create category', details: err.message });
    }
  }
);


const updateCaseStudiesCategory = handlePermission(
  "caseStudiesCategory",
  "update",
  caseStudiesCategoryImg,
  async (req, res) => {
    const { name } = req.body;
    req.body.slug = slugify(req.body.slug || name, { lower: true });

    const Category = await performOperation(
      CaseStudiesCategories.findOne.bind(CaseStudiesCategories),
      { slug: req.params.slug }
    );

    if (!Category) {
      return null;
    }

    // Store existing image filenames before updating
    const previousTechnologies = [...Category.technologies];

    // Update fields other than technologies
    Object.assign(Category, req.body);

    // Update images only if the request contains new images
    if (req.files?.length) {
      const newTechnologies = req.files.map((file) => ({
        image: `${uploadPath}${file.filename}`,
        name: file.originalname.split(".").shift(),
      }));

      // Replace existing technologies with new ones
      Category.technologies = newTechnologies;

      // Delete previous images
      await deletePreviousImages(previousTechnologies);
    }

    await Category.save();
    return Category;
  }
);

const getCaseStudiesCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    if (slug === "all") {
      const categories = await CaseStudiesCategories.find();
      return res.status(StatusCodes.OK).json({ result: categories });
    }

    const Category = await CaseStudiesCategories.findOne({ slug });
    if (!Category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Category with this slug not found" });
    }

    return res.status(StatusCodes.OK).json({ result: Category });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteCaseStudiesCategory = async (req, res) => {
  const { slug } = req.params;
  try {
    const Category = await CaseStudiesCategories.findOne({ slug });
    if (!Category) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Category with this slug not found" });
    }

    // Delete images
    await deletePreviousImages(Category.technologies);

    // Delete the Category
    await Category.deleteOne();

    return res
      .status(StatusCodes.OK)
      .json({ result: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

module.exports = {
  createCaseStudiesCategory,
  updateCaseStudiesCategory,
  getCaseStudiesCategory,
  deleteCaseStudiesCategory,
};
