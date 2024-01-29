const Career = require("../Models/Career_Model.jsx");
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
        const { jobName, jobDescription, experienceRequired, openings, description } =
        req.body;
    
        const job = await performOperation(Career.create, {
        jobName,
        jobDescription,
        experienceRequired,
        openings,
        description,
        });
    
        return job;
    }
    );

    module.exports = {
        createJob,
    };
