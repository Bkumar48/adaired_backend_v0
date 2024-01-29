const Career = require("../Models/Career_Model.js");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0]?.permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, operation) =>
  asyncHandler(async (req, res, next) => {
    const { userId } = req;

    if (!checkPermission(userId, entity, action)) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "You are not allowed to perform this action" });
    }

    try {
      const result = await operation(req, res, next);
      const status = result ? StatusCodes.ACCEPTED : StatusCodes.NOT_FOUND;
      res.status(status).json(result ? { result } : { error: "Not Found" });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  });

const performOperation = async (modelMethod, ...args) => modelMethod(...args);

const createJob = handlePermission(
  "career",
  "create",
  async (req, res, next) => {
    console.log("req.body", req.body)
    const job = await performOperation(Career.create.bind(Career), req.body);

    return job;
  }
);

const updateJob = handlePermission(
  "career",
  "update",
  async (req, res, next) => {
    const jobId = req.params.id; // Assuming the job ID is in the route parameters
    const updateData = req.body;

    try {
      const updatedJob = await Career.findByIdAndUpdate(jobId, updateData, {
        new: true,
      });
      if (!updatedJob) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Job not found" });
      }
      return res.status(StatusCodes.OK).json({ result: updatedJob });
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }
);

const deleteJob = handlePermission(
  "career",
  "delete",
  async (req, res, next) => {
    const jobId = req.params.id; // Assuming the job ID is in the route parameters

    try {
      const deletedJob = await Career.findByIdAndDelete(jobId);
      if (!deletedJob) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Job not found" });
      }

      // Convert the deletedJob to a plain JavaScript object
      const deletedJobObject = deletedJob.toObject();

      return res.status(StatusCodes.OK).json({
        result: "Job deleted successfully",
        deletedJob: deletedJobObject,
      });
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  }
);

const findJob = async (req, res, next) => {
  const jobId = req.params.id;

  try {
    if (jobId === "all") {
      const allJobs = await Career.find();
      return res.status(StatusCodes.OK).json({ result: allJobs });
    }

    const job = await Career.findById(jobId);
    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Job not found" });
    }
    return res.status(StatusCodes.OK).json({ result: job });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

module.exports = {
  findJob,
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  findJob,
};
