"use strict";
const mongoose = require("mongoose");

const defaultString = { type: String, default: "" };

const mainServiceSchema = new mongoose.Schema(
  {
    serviceTitle: {...defaultString, required: true },
    serviceDescription: defaultString,
    serviceImage: defaultString,
    serviceDescriptionII: defaultString,
    serviceHeadingII: defaultString,
    serviceDescriptionIII: defaultString,
    fourPoints: { type: [String], default: [] },
    ourProcessSubHeading: defaultString,
    ourProcessImageI: defaultString,
    ourProcessImageII: defaultString,
    leftImage: defaultString,
    rightText: defaultString,
    leftText: defaultString,
    rightImage: defaultString,
    serviceHeadingIII: defaultString,
    serviceDescriptionIV: defaultString,
    serviceNote: defaultString,
    LastSectionText: defaultString,
    LastSectionImage: defaultString,
  },
  { timestamps: true }
);

mainServiceSchema.index({ serviceTitle: 1 });

const mainService = mongoose.model("mainService", mainServiceSchema);

module.exports = mainService;
