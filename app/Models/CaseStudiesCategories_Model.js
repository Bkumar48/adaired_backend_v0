const mongoose = require("mongoose");

const caseStudiesCategoriesSchema = new mongoose.Schema(
  {
    name: String,
    slug: {
      type: String,
      index: true, // Add an index if frequently queried
    },
    technologies: [
      {
        image: String,
        name: String,
      },
    ],
  },
  {
    minimize: false, // Keep empty objects in the document
    timestamps: true, // Add createdAt and updatedAt fields
  }
);


const CaseStudiesCategories = mongoose.model(
  "CaseStudiesCategories",
  caseStudiesCategoriesSchema
);

module.exports = CaseStudiesCategories;
