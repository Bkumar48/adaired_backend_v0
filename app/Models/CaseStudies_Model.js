const mongoose = require("mongoose");

const caseStudiesSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      index: true,
    },
    colorScheme: String,
    slug: String,
    subHeading: String,
    caseStudyName: String,
    caseStudyDescription: String,
    caseStudyImage: String,
    aboutProjectDescription: String,
    challengesImage: String,
    challengesDescription: String,
    solutionsImage: String,
    solutionsDescription: String,
    challengesAndSolutions: {
      type: [{}],
      default: [{}],
    },
    technologiesUsedTitle: String,
    technologiesUsedDescription: String,
    technologiesUsed: {
      type: [{}],
      default: [{}],
    },
    goalsTitle: String,
    goalsDescription: String,
    objectives: [
      {
        title: String,
        content: String,
      },
    ],
    stratergy: [
      {
        title: String,
        content: String,
      },
    ],
    goalImage: String,
    growthBox: [
      {
        title: String,
        content: String,
      },
    ],
    resultDescription: String,
    resultBox: {
      type: [{}],
      default: [{}],
    },
    resultFinalDescription: String,
  },
  {
    // Additional schema options
    timestamps: true, // Add timestamps for automatic createdAt and updatedAt fields
    minimize: false, // Disable automatic field minimization
    strict: "throw", // Throw an error for unknown fields
  }
);

caseStudiesSchema.index({ category: 1, slug: 1, "objectives.title": 1 }); // Add more indexes as needed

const CaseStudies = mongoose.model("CaseStudies", caseStudiesSchema);

module.exports = CaseStudies;
