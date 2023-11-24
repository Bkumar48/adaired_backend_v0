const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Items = new Schema(
  {
    productTile:{
      type:String,
      default:""
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity can not be less then 1."],
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice:{
      type: Number,
      default:"",
    },
    discount:{
      type: Number,
      default:"",
    },
    total: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("items", Items);

const CartSchema = new Schema(
  {
userId: {type: mongoose.Schema.Types.ObjectId,ref: "User"},
items: [Items],
coupon:{type:String,default:"" },
couponId:{type: mongoose.Schema.Types.ObjectId, ref: "copoun" },
couponDiscount:{type:Number, default:""},    
couponDiscountType:{type:Number, default:""},    
discountedPrice: {default:'',type: Number},
subTotal:{default: 0,type: Number },
 },
 {
    timestamps: true,
  }
);
module.exports = mongoose.model("cart", CartSchema);

// module.exports = {
//   Items: mongoose.model("items", Items),
//   Cart: mongoose.model("cart", CartSchema),
// };