import mongoose, { Schema } from 'mongoose';
import { CHECKOUT_STATUS, PRODUCT_SELL_TYPE, RORYALTY_STATUS } from '~/helpers/constants.helper';

const checkoutSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: '',
    },
    buyer_email: {
      type: String,
      default: '',
    },
    buyer_username: {
      type: String,
      default: '',
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    crop_size: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
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
    shippingInfo: {
      type: {
        name: {
          type: String,
          default: '',
        },
        price: {
          type: String,
          default: '',
        },
      },
    },
    shipTo: {
      type: {
        firstName: {
          type: String,
          default: '',
        },
        lastName: {
          type: String,
          default: '',
        },
        email: {
          type: String,
          default: '',
        },
        address1: {
          type: String,
          default: '',
        },
        address2: {
          type: String,
          default: '',
        },
        city: {
          type: String,
          default: '',
        },
        state: {
          type: String,
          default: '',
        },
        country: {
          type: String,
          default: '',
        },
        zipCode: {
          type: String,
          default: '',
        },
      },
    },
    totalPrice: {
      type: String,
      default: '',
    },
    subTotal: {
      type: String,
      default: '',
    },
    tip: {
      type: String,
      default: '',
    },
    checkout_status: {
      type: String,
      enum: Object.values(CHECKOUT_STATUS),
      default: '',
    },
    royalty: {
      type: Number,
      default: 0,
    },
    royalty_status: {
      type: String,
      enum: Object.values(RORYALTY_STATUS),
      default: 'UNPAID',
    },
  },
  { timestamps: true },
);

const Checkout = mongoose.model('Checkout', checkoutSchema);

export default Checkout;
