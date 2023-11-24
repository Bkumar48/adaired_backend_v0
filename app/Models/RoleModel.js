// const mongoose = require("mongoose");

// //---------------------------------Permission Schema---------------------------------//
// const PermissionSchema = new mongoose.Schema({
//   // roleId: {
//   //   type: mongoose.Schema.Types.ObjectId,
//   //   ref: "Role",
//   // },
//   roleId: {
//     type: String,
//     required: true,
//   },

//   users: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   role: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   permission: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   page: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   blogs: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   blogs_cate: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   product: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   product_cate: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   coupon: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   ticket: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   faq: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   faq_cate: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   orders: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   testimonial: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
//   priceRules: {
//     create: Boolean,
//     default: false,
//     read: Boolean,
//     default: false,
//     update: Boolean,
//     default: false,
//     delete: Boolean,
//     default: false,
//   },
// });
 
// const permission = mongoose.models.Permission || mongoose.model('Permission', PermissionSchema); 

// PermissionSchema.methods.toJSON = function () {
//   return {
//     id: this._id,
//     users: this.users,
//   };
// };

// // ---------------------------------Role Schema---------------------------------//
// var roleSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     description: {
//       type: String,
//       required: false,
//     },
//     status:{type: Number,
//       enum: [1, 2],
//       default:1
//     },
//     permissions: [{type: mongoose.Schema.Types.ObjectId,ref: "Permission",
//       }]
//     },  
//   {
//     timestamps: true,
//   }
// );


// const role =  mongoose.models.Role || mongoose.model('Role', roleSchema); 

// module.exports = { role, permission };





const mongoose = require("mongoose");

// Permission Schema
const PermissionSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      required: true,
    },
    users: createPermissionSchema(),
    role: createPermissionSchema(),
    permission: createPermissionSchema(),
    page: createPermissionSchema(),
    blogs: createPermissionSchema(),
    blogs_cate: createPermissionSchema(),
    product: createPermissionSchema(),
    product_cate: createPermissionSchema(),
    coupon: createPermissionSchema(),
    ticket: createPermissionSchema(),
    faq: createPermissionSchema(),
    faq_cate: createPermissionSchema(),
    orders: createPermissionSchema(),
    testimonial: createPermissionSchema(),
    priceRules: createPermissionSchema(),
    mainService: createPermissionSchema(),
  },
  { timestamps: true }
);

function createPermissionSchema() {
  return {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  };
}

const Permission = mongoose.model("Permission", PermissionSchema);

PermissionSchema.methods.toJSON = function () {
  const { _id, users } = this;
  return { id: _id, users };
};

// Role Schema
const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    status: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", RoleSchema);

module.exports = { Role, Permission };

