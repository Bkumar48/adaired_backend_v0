const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var testimonialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
       default:""
    },
    description: {
      type: String,
      default:""
    },
    rating:{
            typo:Number, 
            default:""
        }, 
    image:{
            type:String, 
            default:""
    },
    status:{
        type:Boolean,
        default:1
    },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("testimonial", testimonialSchema);   