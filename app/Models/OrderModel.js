const mongoose = require("mongoose");
const Schema = mongoose.Schema;


let billing = new Schema(
    {
        firstName: {
            type: String,
            default:""
           },
          lastName: {
            type: String,
            default:"",
          },
          email: {
            type: String,
            default:"",
       
          },
          mobile: {
            type: String,
            default:"",
          },
      
      
    },
    {
      timestamps: true,
    }
  );
  module.exports = mongoose.model("billing", billing);

let OrderSchema = new Schema(
  {
    orderId:{type:Number, default:""},
    items: {type:Array},
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bitcoinAmountReceive:{
      type:String,
      default:""
    },
    bitcoinAmount:{
      type:String,
      default:""
    },
    txid:{  type:String,
      default:""},
    bitcoinAddress:{
      type:String,
      default:""
    },
    orderstatus:{
      type:String, enum: ['pending','completed','hold', 'cancelled','processing','refund','failed', 'fraud','Active'], default:"pending"
    },
    billing: [billing],
    couponDiscountType:{type:Number, default:""},
    couponDiscount:{type:Number,default:"" },
    couponId:{type: mongoose.Schema.Types.ObjectId, ref: "copoun",default:''},
    couponCode:{type:String, default:""},
    discountedPrice:{type:Number, default:"" },
    actualPrice:{type:Number, default:"" },
    pay_url:{ type:String,   default:""
    },  
    payment_status:{
        type:String, enum: ['unpaid','paid','cancelled', 'unconfirmed'], default:"unpaid"
    },
    payment_method:{
        type:String, enum: ['bitcoin','razorpay','stripe', 'paypal','bankTransfer'], default:"bitcoin"
    } , 
    deleted_at:{
        type : Date, default:""
    }
    },
    
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("orders", OrderSchema);

