const BlogCategory = require("../Models/BlogCategoryModel");
const asyncHandler = require("express-async-handler");
const { ObjectId } = require("mongoose").Types;
const { StatusCodes } = require("http-status-codes");

/**
 * Checks if the user has the required permission for a specific action.
 * @param {Object} userId - User object containing information about the user.
 * @param {string} permissionType - Type of permission being checked.
 * @returns {boolean} - Boolean indicating whether the user has the required permission.
 */
const checkPermission = (userId, permissionType) => {
  const { roleType, role } = userId;
  return (
    roleType === "admin" ||
    role[0]?.permissions[0]?.blogcategories?.[permissionType]
  );
};

/**
 * Sends an unauthorized response with a specified message.
 * @param {Object} res - Express response object.
 * @param {string} message - Message to be sent in the response.
 * @returns {Object} - Response with an unauthorized status code and the specified message.
 */
const accessDenied = (res, message) => {
  return res.status(StatusCodes.UNAUTHORIZED).send({
    success: false,
    msg: message,
  });
};

/**
 * Creates a new blog category based on the provided data.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response indicating the success or failure of the operation along with relevant data.
 */
const createNewCategory = asyncHandler(async (req, res) => {
  const { userId } = req;
  const canCreateCategory = checkPermission(userId, "create");
  if (!canCreateCategory) {
    return accessDenied(res, "You don't have permission to create category");
  }

  try {
    const { parentId } = req.body;
    const isSubCategory = !!parentId;

    // Create a new category using the BlogCategory model
    const categoryData = await BlogCategory.create({
      ...req.body,
      isSubCategory,
      parentId: isSubCategory ? ObjectId(parentId) : null,
    });

    // If it's a subcategory, update the parent's subcategories array
    if (isSubCategory) {
      await BlogCategory.findByIdAndUpdate(
        parentId,
        { $addToSet: { subCategories: categoryData._id } },
        { new: true }
      );
    }

    // Send success response with the created category data
    res.status(StatusCodes.OK).send({
      success: true,
      msg: "Category Saved Successfully",
      data: categoryData,
    });
  } catch (error) {
    // Send error response if something goes wrong during category creation
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      msg: "Something went wrong",
      error: error.message,
    });
  }
});

/**
 * Retrieves blog categories based on specified criteria.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response containing the retrieved categories or an error message if no categories are found.
 */
const findCategory = asyncHandler(async (req, res) => {
  try {
    const { allParent, allChild, parentId, childId, Id } = req.query;

    let query = {};

    // Build query based on request parameters
    if (allParent) {
      query = { isSubCategory: false };
    } else if (allChild) {
      query = { isSubCategory: true };
    } else if (parentId && childId) {
      // query = { _id: { $in: [ObjectId(parentId), ObjectId(childId)] } };
      query = { parentId, _id: childId };
    } else if (Id) {
      query = { _id: Id };
    } else {
      // If no specific criteria provided, retrieve all categories
      const categoryList = await BlogCategory.find();
      return res.status(StatusCodes.OK).send({
        success: true,
        msg: "Category List",
        data: categoryList,
      });
    }

    // Find categories based on the constructed query
    const category = await BlogCategory.find(query);

    // Send response with the retrieved categories or an error message if not found
    if (category.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ error: "Category not found" });
    }

    res.status(StatusCodes.OK).send({
      success: true,
      msg: "Category List",
      data: category,
    });
  } catch (error) {
    // Send error response if something goes wrong during category retrieval
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      msg: "Something went wrong",
      error: error.message,
    });
  }
});

/**
 * Deletes a blog category and its subcategories based on the provided category ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response indicating the success or failure of the operation.
 */
const deleteCategoryById = asyncHandler(async (req, res) => {
  const { userId } = req;
  const canDeleteCategory = checkPermission(userId, "delete");
  if (!canDeleteCategory) {
    return accessDenied(res, "You don't have permission to delete category");
  }

  try {
    const { categoryId } = req.params;

    // Find the category to be deleted
    const category = await BlogCategory.findById(categoryId);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        msg: "Category not found",
      });
    }

    // If it's a subcategory, update the parent's subcategories array
    if (category.isSubCategory) {
      await BlogCategory.findByIdAndUpdate(
        category.parentId,
        { $pull: { subCategories: categoryId } },
        { new: true }
      );
    } else {
      // If it's a parent category, delete all its subcategories recursively
      await deleteSubCategories(categoryId);
    }

    // Remove the category and all its subcategories
    await BlogCategory.deleteMany({
      _id: { $in: [categoryId, ...category.subCategories] },
    });

    // Send success response
    res.status(StatusCodes.OK).send({
      success: true,
      msg: "Category and its subcategories deleted successfully",
    });
  } catch (error) {
    // Send error response if something goes wrong during category deletion
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      msg: "Something went wrong",
      error: error.message,
    });
  }
});

/**
 * Updates an existing blog category's information.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Response indicating the success or failure of the operation along with the updated category data.
 */
const updateCategoryById = asyncHandler(async (req, res) => {
  const { userId } = req;
  const canUpdateCategory = checkPermission(userId, "update");
  if (!canUpdateCategory) {
    return accessDenied(res, "You don't have permission to update category");
  }

  try {
    const { categoryId } = req.params;
    const { parentId, ...updateData } = req.body;
    const isSubCategory = !!parentId;

    // Find the category to be updated
    const category = await BlogCategory.findById(categoryId);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).send({
        success: false,
        msg: "Category not found",
      });
    }

    // If the parent is changed, update the subcategories array of both the old and new parents
    if (category.parentId.toString() !== parentId) {
      await Promise.all([
        BlogCategory.findByIdAndUpdate(
          category.parentId,
          { $pull: { subCategories: categoryId } },
          { new: true }
        ),
        BlogCategory.findByIdAndUpdate(
          parentId,
          { $addToSet: { subCategories: categoryId } },
          { new: true }
        ),
      ]);
    }

    // Update category information
    category.categoryName = updateData.categoryName || category.categoryName;
    category.isSubCategory = isSubCategory;
    category.parentId = isSubCategory ? ObjectId(parentId) : null;

    // Save the updated category
    const updatedCategory = await category.save();

    // Send success response with the updated category data
    res.status(StatusCodes.OK).send({
      success: true,
      msg: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    // Send error response if something goes wrong during category update
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      msg: "Something went wrong",
      error: error.message,
    });
  }
});

/**
 * Recursive function to delete all child categories.
 * @param {ObjectId} parentId - ID of the parent category.
 * @returns {Promise<void>} - Promise indicating the completion of the operation.
 */
const deleteSubCategories = async (parentId) => {
  const parentCategory = await BlogCategory.findById(parentId).lean();

  // Extract subcategory IDs
  const subCategoryIds = parentCategory.subCategories.map((id) =>
    ObjectId(id.toString())
  );

  // Delete all subcategories in a single operation
  await BlogCategory.deleteMany({
    _id: { $in: subCategoryIds },
  });
};

// Exporting the functions to be used in other modules
module.exports = {
  createNewCategory,
  findCategory,
  deleteCategoryById,
  updateCategoryById,
};
