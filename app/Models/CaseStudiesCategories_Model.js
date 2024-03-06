const mongoose = require("mongoose");

const defaultString = { type: String, default: "" };

const caseStudiesCategoriesSchema = new mongoose.Schema(
  {
    categoryName: {
      ...defaultString,
      required: true,
    },
    slug: {
      ...defaultString,
      index: true,
      unique: true,
    },
    technologies: [
      {
        icon: String,
        title: String,
      },
    ],
    childrens: { type: [String], default: [] },
  },
  {
    // minimize: false, // Keep empty objects in the document
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

const CaseStudiesCategories = mongoose.model(
  "CaseStudiesCategories",
  caseStudiesCategoriesSchema
);

module.exports = CaseStudiesCategories;
