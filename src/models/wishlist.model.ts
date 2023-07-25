import mongoose, { Schema } from 'mongoose';
const wishListSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      default: 'Product',
      required: true,
    },
    wishlist_group_id: {
      type: Schema.Types.ObjectId,
      ref: 'WishListGroup',
      required: true,
    }
  },
  { timestamps: true },
);

const WishList = mongoose.model('Wishlist', wishListSchema);

export default WishList;
