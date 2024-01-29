const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    jobName: String,
    jobDescription: String,
    experienceRequired: String,
    openings: Number,
    description: String,
  },
  {
    timestamps: true,
    minimize: false,
    strict: "throw",
  }
);
careerSchema.index({ jobName: 1 });

const Career = mongoose.model("Career", careerSchema);

module.exports = Career;
