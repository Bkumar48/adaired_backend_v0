const mongoose = require("mongoose");
const ticketSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId, ref:"users", default:""},
  name:{type:String, default:""},
  assignedto:{type:String, default:""},
  email: { type: String, default:"" },
  contact:{type:String, default:""},
  subject:{type:String, default:""},
  query:{type:String, default:""},
  ticketId:{type:String, default:""},
  ticketBy:{type:String, enum: ['admin','customer'], default:""},
  status:{type:String, enum: ['open','closed','escalated', 'on-hold'], default:""},
  read_status:{type:String, enum: ['read','unread'], default:""},
  user_read_status:{type:String, enum: ['read','unread'], default:""},
  replied:{type:Date, default:Date.now()},
  conversation:[{
    repliedBy:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    message:{type:String, default:""},
    repliedByRole:{type:String, enum: ['admin','customer'], default:""},
    date:{type:Date, default:Date.now()},
  }],
},
{timestamps: true}
);

module.exports = mongoose.model("ticket", ticketSchema);