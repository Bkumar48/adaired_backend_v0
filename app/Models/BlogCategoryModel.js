"use strict";

const mongoose = require("mongoose");

const defaultString = { type: String, default: "" };

const BlogCategorySchema = new mongoose.Schema({
  isSubCategory: { type: Boolean, default: false },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogCategory",
    default: null,
  },
  subCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: [],
    },
  ],
  categoryName: { ...defaultString, required: true },
  slug: defaultString,
  status: { type: Boolean, default: true },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      default: [],
    },
  ],
});

BlogCategorySchema.index({ categoryName: 1 });

const BlogCategory = mongoose.model("BlogCategory", BlogCategorySchema);

module.exports = BlogCategory;
