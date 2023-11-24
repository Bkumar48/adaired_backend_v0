const { Role, Permission } = require("../Models/RoleModel");
const UserModel = require("../Models/UserModel");
const asyncHandler = require("express-async-handler");

//******************************************************************************
// ROLES SECTION
//******************************************************************************

// create a role
const createRole = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.create == true;
  }
  try {
    if (userInfo.roleType == "admin") { 
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const { name, description } = req.body;
      if (!name) {
        return res
          .status(400)
          .send({ status: false, message: "Role name is required" });
      }
      const role = await Role.create({ name, description });
      return res
        .status(200)
        .send({
          status: true,
          roleId: role._id,
          message: "Role saved successfully! :)",
        });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to create users role" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// get all roles
const getAllRoles = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.read == true;
  }
  console.log(userInfo.roleType)
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const roles = await Role.find();
      return res.status(200).send({ status: true, data: roles });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to all roles of users" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// get one role
const getOneRole = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.read == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const roleList = await Role.findById(req.query.roleId).populate(
        "permissions"
      );
      return res.status(200).send({ status: true, data: roleList });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to user role" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// update a role
const updateRole = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const roleId = req.query.roleId;
  const { name, description } = req.body;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.update == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const query = { name, description };
      await Role.findByIdAndUpdate(roleId, { $set: query });
      return res
        .status(200)
        .send({ status: true, message: "Role updated successfully! :)" });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to update users role" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// delete a role
const deleteRole = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const roleId = req.query.roleId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.delete == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const checkRole = await UserModel.find({ role: { $in: roleId } }).count();
      if (checkRole > 0) {
        return res
          .status(400)
          .send({
            status: false,
            message: "User role already exists in User so can't delete it",
          });
      }
      const checkPermission = await Permission.find({ roleId: roleId }).count();
      if (checkPermission > 0) {
        return res
          .status(400)
          .send({
            status: false,
            message:
              "User role already exists in Permission so can't delete it",
          });
      } else {
        await Role.findByIdAndDelete(req.query.roleId);
        return res
          .status(200)
          .send({ status: true, message: "Role deleted successfully! :)" });
      }
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to delete role" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// get Permissions by roleId
const getPermissionsByRoleId = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].role.read == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const role = await Role.findById(req.query.roleId);
      const permissions = await Permission.find({
        _id: { $in: role.permissions },
      });
      return res.status(200).send({ status: true, data: permissions });
    } else {
      return res
        .status(400)
        .send({ status: false, message: "Deny access to role of users" });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

//******************************************************************************
// PERMISSION SECTION
//******************************************************************************

// create a permission
const createPermission = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].permission.create == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      const create = await Permission.create(req.body);
      create.save();
      const roleData = await Role.findByIdAndUpdate(req.body.roleId, {
        $set: { permissions: create._id },
      });
      return res
        .status(200)
        .send({ status: true, message: "Permission saved successfully! :)" , data: create});
        
    } else {
      return res
        .status(400)
        .send({
          status: false,
          message: "Deny access to create users permission",
        });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// delete a permission
const deletePermission = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const permId = req.query.permissionId;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].permission.delete == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      await Role.updateOne(
        { permissions: permId },
        { $unset: { permissions: "" } }
      );
      await Permission.findByIdAndDelete(permId);
      return res
        .status(200)
        .send({ status: true, message: "Permission deleted successfully! :)" });
    } else {
      return res
        .status(400)
        .send({
          status: false,
          message: "Deny access to users permission delete",
        });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

// update a permission
const updatePermission = asyncHandler(async (req, res) => {
  const userInfo = req.userId;
  const permId = req.query.permissionId;
  const query = req.body;
  let getList = "";
  let permissions = "";
  if (userInfo.role[0] !== undefined) {
    permissions = userInfo.role[0].permissions[0].permission.update == true;
  }
  try {
    if (userInfo.roleType == "admin") {
      getList = true;
    }
    if (userInfo.roleType == "user" && permissions) {
      getList = true;
    }
    if (getList == true) {
      await Permission.findByIdAndUpdate(permId, { $set: query });
      return res
        .status(200)
        .send({ status: true, message: "Permission updated successfully! :)" });
    } else {
      return res
        .status(400)
        .send({
          status: false,
          message: "Deny access to users permission update",
        });
    }
  } catch (error) {
    return res.status(400).send({ status: false, message: error.message });
  }
});

module.exports = {
  createRole,
  getAllRoles,
  getOneRole,
  updateRole,
  deleteRole,
  createPermission,
  deletePermission,
  updatePermission,
  getPermissionsByRoleId,
};
