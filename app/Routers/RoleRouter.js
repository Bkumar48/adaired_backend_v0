const express = require("express");
const router = express.Router();
const { authMiddleware} = require("../Middleware/authMiddleware");

const {
  createRole,
  getAllRoles,
  getOneRole,
  updateRole,
  deleteRole,
  createPermission,
  deletePermission,
  updatePermission,
  getPermissionsByRoleId,
} = require("../Controllers/RoleController");

router.post("/create", authMiddleware,createRole);
router.get("/all", authMiddleware, getAllRoles);
router.get("/getOneRole", authMiddleware, getOneRole);
router.put("/updateRole", authMiddleware, updateRole);
router.delete("/deleteRole", authMiddleware, deleteRole);
router.get("/getPermissionsByRoleId", authMiddleware, getPermissionsByRoleId);

// permissions routes
router.post("/permissions/create-permission", authMiddleware, createPermission);
router.delete("/permissions/delete-permission/", authMiddleware, deletePermission);
router.put("/permissions/update-permission", authMiddleware, updatePermission);

module.exports = router;
