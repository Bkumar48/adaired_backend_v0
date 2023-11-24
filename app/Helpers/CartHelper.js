const Cart = require("../Models/CartModel");
exports.cart = async (userId) => {
    const carts = await Cart.find({userId:userId}).populate({
        path: "items.productId",
        select: "title image",
    }).populate('userId',{ firstName: 1, lastName: 1, email:1}).populate('couponId',{ code: 1});
    return carts[0];
};

exports.addItem = async (payload) => {
    // Manually populate the userId field before saving the cart item
    const populate = async () => {
        const populatedCart = await Cart.findOne({ userId: payload.userId })
            .populate('userId', { firstName: 1, lastName: 1, email: 1 })
            .populate({
                path: "items.productId",
                select: "title"
            })
            .populate('couponId', { code: 1 });
        return populatedCart;
    };

    const populatedCart = await populate();

    if (populatedCart) {
        populatedCart.items.push(payload.items[0]);
        populatedCart.subTotal = Math.round(populatedCart.items.map(item => item.total).reduce((acc, next) => acc + next) * 100) / 100;
        await populatedCart.save();
        return populatedCart;
    } else {
        const newCart = await Cart.create(payload);
        return newCart;
    }
};


exports.deleteCart = async (userId) => {
    const carts = await Cart.findOneAndDelete({userId:userId});
    return carts[0];
}

exports.updateCouponCart = async (userId,data)=>{
    const carts = await Cart.findOneAndUpdate({userId:userId},{$set:data});
    return carts[0];
}

exports.unsetCouponCart = async (userId,data)=>{
    const carts = await Cart.findOneAndUpdate({userId:userId},{$unset:data});
    return carts[0];
}