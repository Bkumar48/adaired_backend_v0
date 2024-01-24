"use strict";
const mongoose = require("mongoose");

const defaultString = { type: String, default: "" };

const ServiceSchema = new mongoose.Schema(
  {
    isChildService: { type: Boolean, default: false },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Services",
      default: null,
    },
    childrens: { type: [String], default: [] },
    serviceBanner: defaultString,
    serviceTitle: { ...defaultString, required: true },
    slug: { ...defaultString, unique: true },
    serviceDescription: defaultString,
    mainTwoPoints: {
      type: [{}],
      default: [{}],
    },
    serviceImage: defaultString,
    serviceDescriptionII: defaultString,
    serviceHeadingII: defaultString,
    serviceDescriptionIII: defaultString,
    fourPoints: { type: [String], default: [] },
    ourProcessSubHeading: defaultString,
    ourProcessImageI: defaultString, 
    ourProcessImageII: defaultString,
    combinedSection: {
      type: [{}],
      default: [{}],
    },
    serviceHeadingIII: defaultString,
    serviceDescriptionIV: defaultString,
    serviceNote: defaultString,
    LastSectionSubHeading: defaultString,
    LastSectionHeading: defaultString,
    LastSectionText: defaultString,
    LastSectionPoints: {
      type: [{}],
      default: [{}],
    },
    LastSectionHookLine: defaultString,
    LastSectionImage: defaultString,
  },
  { timestamps: true }
);

ServiceSchema.index({ serviceTitle: 1 });

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;
