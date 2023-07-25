import mongoose, { Schema } from 'mongoose';

const shippingSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    first_name: {
        type: String,
        default: '',
        required: true,
    },
    last_name: {
        type: String,
        default: '',
        required: true,
    },
    email: {
        type: String,
        unique: true,
        default: '',
        required: true,
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
    phone_number: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    postcode: {
        type: String,
        default: '',
    },
  },
  { timestamps: true },
);

const Shipping = mongoose.model('Shipping', shippingSchema);

export default Shipping;
