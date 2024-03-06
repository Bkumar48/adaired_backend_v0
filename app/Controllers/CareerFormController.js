const CareerForm = require("../Models/CareerFormModel");
const asyncHandler = require("express-async-handler");
const { resumePdf } = require("../Middleware/fileUpload");
const uploadPath = process.env.UPLOAD_RESUME;
const { StatusCodes } = require("http-status-codes");

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, uploadMiddleware, operation) =>
  asyncHandler(async (req, res, next) => {
    const { userId } = req;

    // Exclude permission check for create operation
    if (operation === createCareerForm) {
      try {
        await uploadMiddleware(req, res, async (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
          }
          const result = await operation(req, res, next);
          const status = result ? 200 : 404;
          //   res.status(status).json(result ? { result } : { error: "Not Found" });
        });
      } catch (error) {
        console.error(error);
        // res.status(500).json({ error: error.message });
      }
    } else {
      // Perform permission check for other operations
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
          const status = result ? StatusCodes.ACCEPTED : StatusCodes.NOT_FOUND;
        });
      } catch (error) {
        console.error(error);
      }
    }
  });

const createCareerForm = asyncHandler(async (req, res) => {
  const { name, email, phone, current_designation, message } = req.body;
  const { userId } = req;
  const resume = uploadPath + req.files[0].filename;
  const careerForm = new CareerForm({
    name,
    email,
    phone,
    current_designation,
    resume,
    message,
  });
  const result = await careerForm.save();
  res.status(StatusCodes.CREATED).json({ result });
});

const getCareerForm = asyncHandler(async (req, res) => {
  const { userId } = req;
  const result = await CareerForm.find();
  res.status(StatusCodes.OK).json({ result });
});

const getCareerFormById = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const result = await CareerForm.findById(id);
  res.status(StatusCodes.OK).json({ result });
});

const updateCareerForm = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { name, email, phone, current_designation, message } = req.body;
  const resume = req.files[0].filename;
  const result = await CareerForm.findByIdAndUpdate(
    id,
    {
      name,
      email,
      phone,
      current_designation,
      resume,
      message,
    },
    { new: true }
  );
  res.status(StatusCodes.OK).json({ result });
});

const deleteCareerForm = asyncHandler(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const result = await CareerForm.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ result });
});

module.exports = {
  createCareerForm: handlePermission(
    "careerForm",
    "create",
    resumePdf,
    createCareerForm
  ),
  getCareerForm: handlePermission("careerForm", "read", null, getCareerForm),
  getCareerFormById: handlePermission(
    "careerForm",
    "read",
    null,
    getCareerFormById
  ),
  updateCareerForm: handlePermission(
    "careerForm",
    "update",
    resumePdf,
    updateCareerForm
  ),
  deleteCareerForm: handlePermission(
    "careerForm",
    "delete",
    null,
    deleteCareerForm
  ),
};
