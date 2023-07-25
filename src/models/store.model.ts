import mongoose, { Schema } from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
        type: String,
        default: '',
        required: true,
    },
    status: {
        type: String,
        default: 'o-deleted',
    },
    description: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    contentCategory: {
        type: Array,
        default: [],
    }
  },
  { timestamps: true },
);

const Store = mongoose.model('Store', storeSchema);

export default Store;
