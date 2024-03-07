const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (header != undefined) {
    token = header.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user_id)
          .select(["_id", "email", "roleType", "role"])
          .populate({
            path: "role",
            populate: {
              path: "permissions",
              model: "Permission",
            },
          });
        req.userId = user;
        next();
      }
    } catch (err) {
      return res.status(400).send({ status: false, msg: "Not Authorized!" });
    }
  } else {
    return res
      .status(400)
      .send({ status: false, msg: "Required Authencation!" });
  }
});

module.exports = { authMiddleware };
