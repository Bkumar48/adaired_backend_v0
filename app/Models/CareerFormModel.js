"use strict";

const mongoose = require("mongoose");

const defaultString = { type: String, default: "" };

const CareerFormSchema = new mongoose.Schema({
  name: defaultString,
  email: defaultString,
  phone: defaultString,
  current_designation: defaultString,
  resume: defaultString,
  message: defaultString,
  status: { type: Boolean, default: true },
});

const CareerForm = mongoose.model("CareerForm", CareerFormSchema);

module.exports = CareerForm;


