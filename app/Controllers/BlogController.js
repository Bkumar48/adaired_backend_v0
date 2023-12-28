const Blog = require("../Models/BlogModal");
const { ObjectId } = require("mongoose").Types;
const asyncHandler = require("express-async-handler");
const { blogImg } = require("../Middleware/fileUpload");
const fs = require("fs").promises;
const { StatusCodes } = require("http-status-codes");
const BlogCategory = require("../Models/BlogCategoryModel");
const uploadPath = process.env.UPLOAD_BLOG;

const checkPermission = (userInfo, entity, action) =>
  userInfo?.roleType === "admin" ||
  userInfo?.role?.[0].permissions?.[0]?.[entity]?.[action];

const handlePermission = (entity, action, uploadMiddleware, operation) =>
  asyncHandler(async (req, res, next) => {
    const { userId } = req;

    if (!checkPermission(userId, entity, action)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "You are not allowed to perform this action" });
    }

    try {
      await uploadMiddleware(req, res, async (err) => {
        if (err) {
          console.error(err);
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: err.message });
        }
        const result = await operation(req, res, next);

        result ? res.status(StatusCodes.OK).json({ result }) : next();
      });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  });

const performOperation = async (modelMethod, ...args) => modelMethod(...args);

const setImageFields = async (req, Blog) => {
  const imageFields = ["image"];

  await Promise.all(
    imageFields.map(async (field) => {
      if (req.files?.length) {
        const file = req.files.find((file) => file.fieldname === field);
        if (file) {
          if (Blog[field]) {
            await deleteFile(uploadPath + Blog[field]);
          }
          Blog[field] = file.filename;
        }
      }
    })
  );
  await Blog.save();
};

const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file : ${filePath}`, error);
  }
};

const createBlog = handlePermission(
  "Blog",
  "create",
  blogImg,
  async (req, res) => {
    try {
      const category = req.body.category;
      const { userId } = req;
      const authorId = userId._id;
      const { title, description, slug } = req.body;

      const blog = await performOperation(Blog.create.bind(Blog), {
        title,
        description,
        author: authorId,
        updatedBy: authorId,
        slug,
        category: category,
      });

      // Find the category by ID
      const foundCategory = await BlogCategory.findById(category);

      if (!foundCategory) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Category not found" });
      }

      // Push the blog's ID into the category's blogs array
      foundCategory.blogs.push(blog._id);
      await performOperation(foundCategory.save.bind(foundCategory));

      await setImageFields(req, blog);
      res.status(StatusCodes.OK).json({ result: blog });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

const updateBlog = handlePermission(
  "Blog",
  "update",
  blogImg,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req;
      const { title, description, category, slug } = req.body;

      const existingBlog = await Blog.findById(id).lean();

      if (!existingBlog) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Blog not found" });
      }

      // Find the category by ID
      const oldCategory = existingBlog.category;
      const newCategory = category;

      // Update only the fields that are present in the request body
      const updatedFields = {};
      if (title) updatedFields.title = title;
      if (description) updatedFields.description = description;
      if (category) updatedFields.category = category;
      if (slug) updatedFields.slug = slug;
      updatedFields.updatedBy = userId._id;

      // Use updateOne for partial updates
      await Blog.updateOne({ _id: id }, { $set: updatedFields });

      // If the category is changed, pull the blog ID from the old category
      // and push it into the new category
      if (oldCategory !== newCategory) {
        const oldCategoryObj = await BlogCategory.findById(oldCategory);
        const newCategoryObj = await BlogCategory.findById(newCategory);

        if (oldCategoryObj && newCategoryObj) {
          oldCategoryObj.blogs.pull(id);
          newCategoryObj.blogs.push(id);

          await Promise.all([
            performOperation(oldCategoryObj.save.bind(oldCategoryObj)),
            performOperation(newCategoryObj.save.bind(newCategoryObj)),
          ]);
        }
      }

      res.status(StatusCodes.OK).json({ result: "Blog updated successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);
const getBlog = asyncHandler(async (req, res) => {
  const { Id } = req.query;
  try {
    let query = {};

    if (Id) {
      query = { _id: ObjectId(Id) };
    } else {
      const blogs = await performOperation(Blog.find.bind(Blog));
      res.status(StatusCodes.OK).json({ result: blogs });
    }
    const blog = await performOperation(Blog.find.bind(Blog), query);

    if (!blog) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Blog not found" });
    }

    res.status(StatusCodes.OK).json({ result: blog });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
});

const deleteBlog = handlePermission(
  "Blog",
  "delete",
  (req, res, next) => next(),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const blog = await performOperation(Blog.findById.bind(Blog), id);

      if (!blog) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Blog not found" });
      }

      if (blog.image) {
        await deleteFile(uploadPath + blog.image);
      }

      await performOperation(blog.remove.bind(blog));

      res.status(StatusCodes.OK).json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

const liketheBlog = handlePermission(
  "Blog",
  "like",
  (req, res, next) => next(),
  async (req, res, next) => {
    try {
      const { blogId } = req.body;
      const blog = await performOperation(Blog.findById.bind(Blog), blogId);

      if (!blog) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Blog not found" });
      }

      const loginUserId = req?.userId?._id;
      const isLiked = blog?.isLiked;
      const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
      );

      if (alreadyDisliked) {
        blog.dislikes.pull(loginUserId);
        blog.isDisliked = false;
      }

      if (isLiked) {
        blog.likes.pull(loginUserId);
        blog.isLiked = false;
      } else {
        blog.likes.push(loginUserId);
        blog.isLiked = true;
      }

      const result = await performOperation(blog.save.bind(blog));
      res.status(StatusCodes.OK).json({ result });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

const disliketheBlog = handlePermission(
  "Blog",
  "dislike",
  null,
  async (req, res, next) => {
    try {
      const { blogId } = req.body;
      const blog = await performOperation(Blog.findById.bind(Blog), blogId);

      if (!blog) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Blog not found" });
      }

      const loginUserId = req?.userId?._id;
      const isDisliked = blog?.isDisliked;
      const alreadyLiked = blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString()
      );

      if (alreadyLiked) {
        blog.likes.pull(loginUserId);
        blog.isLiked = false;
      }

      if (isDisliked) {
        blog.dislikes.pull(loginUserId);
        blog.isDisliked = false;
      } else {
        blog.dislikes.push(loginUserId);
        blog.isDisliked = true;
      }

      const result = await performOperation(blog.save.bind(blog));
      res.status(StatusCodes.OK).json({ result });
    } catch (error) {
      console.error(error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
);

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  deleteBlog,
  liketheBlog,
  disliketheBlog,
};
