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
    childrens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: [],
      },
    ],
    serviceBanner: defaultString,
    serviceTitle: { ...defaultString, required: true },
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

ServiceSchema.index({ serviceTitle: 1 });

const Service = mongoose.model("Service", ServiceSchema);

module.exports = Service;
