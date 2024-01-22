const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
    fullname:{type:String, default:""},
    phone:{type:String, default:""},
    email: { type: String, unique: true },
    password: { type: String },
    verify: { type: Boolean, default:false },
});

module.exports = mongoose.model("customer", CustomerSchema);