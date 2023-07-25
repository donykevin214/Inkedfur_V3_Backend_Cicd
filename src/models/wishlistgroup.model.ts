import mongoose, { Schema } from 'mongoose';
const wishListGroupSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wishlistGroupName: {
        type:  String,
        default: '',
        required: true,
    },
    wishlistGroupDescription: {
      type:  String,
      default: '',
      required: true,
  }
  },
  { timestamps: true },
);

const WishListGroup = mongoose.model('WishListGroup', wishListGroupSchema);

export default WishListGroup;
