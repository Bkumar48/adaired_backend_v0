const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const strategySchema = new mongoose.Schema({
  title: String,
  description: String,
});

const technologySchema = new mongoose.Schema({
  image: String,
  name: String,
});

const growthBoxSchema = new mongoose.Schema({
  percentage: String,
  description: String,
});

const resultBoxSchema = new mongoose.Schema({
  image: String,
  title: String,
  percentage: String,
  description: String,
});

const caseStudiesSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseStudiesCategory",
      index: true,
    },
    slug: String,
    subHeading: String,
    caseStudyName: String,
    caseStudyDescription: String,
    caseStudyImage: String,
    aboutProjectDescription: String,
    challengesDescription: String,
    challenges: [String],
    challengesImage: String,
    solutionsDescription: String,
    solutions: [goalSchema],
    solutionsImage: String,
    technologiesUsedTitle: String,
    technologiesUsedDescription: String,
    technologiesUsed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CaseStudiesCategories",
      },
    ],
    goalsTitle: String,
    goalsDescription: String,
    objectives: [goalSchema],
    stratergy: [strategySchema],
    goalImage: String,
    growthBox: [growthBoxSchema],
    resultDescription: String,
    resultBox: [resultBoxSchema],
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
