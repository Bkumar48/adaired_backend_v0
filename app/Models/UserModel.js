const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contact: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    roleType:{type: String,
              enum: ["admin", "user"],
              default: ""
            },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   const salt = await bcrypt.genSaltSync(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   this.confirmPassword = undefined;
// });

// userSchema.methods.isPasswordMatched = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

//Export the model
module.exports =  mongoose.models.User || mongoose.model('User', userSchema); 
