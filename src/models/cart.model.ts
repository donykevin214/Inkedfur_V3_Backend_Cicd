import mongoose, { Schema } from 'mongoose';
import { DEFAULT_PRODUCT_SIZE, PRODUCT_SELL_TYPE } from '~/helpers/constants.helper';

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      required: true,
    },
    product_sell_type: {
      type: String,
      enum: Object.values(PRODUCT_SELL_TYPE),
      default: 'PHYSICAL',
    },
    crop_size: {
      type: String,
      // enum: Object.values(DEFAULT_PRODUCT_SIZE),
      default: '',
    },
    tip: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true },
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
