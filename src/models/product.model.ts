import mongoose, { Schema } from 'mongoose';
import { DEFAULT_PRODUCT_SIZE, PRODUCT_STATUS } from '~/helpers/constants.helper';

const productSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_name: {
      type: String,
      default: '',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    displayImage: {
      type: String,
      default: '',
    },
    physical_price: {
      type: Number,
      default: 0,
    },
    digital_price: {
      type: Number,
      default: 0,
    },
    physical_quantity: {
      type: Number,
      default: 0,
    },
    digital_quantity: {
      type: Number,
      default: 0,
    },
    royalty: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      default: '',
    },
    submission_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    group: {
      type: String,
      default: '',
    },
    importFileName: {
      type: String,
    },
    rowNumber: {
      type: Number,
    },
    slug: {
      type: String,
      default: '',
    },
    rating_key: {
      type: String,
      default: '',
    },
    tags: {
      type: String,
      default: '',
    },

    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    category: [
      {
        type: {
          type: Schema.Types.ObjectId,
          ref: 'Type',
        },
      },
    ],
    other_artist: {
      type: [
        {
          artist_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
        },
      ],
      default: [],
    },
    cropList: [
      {
        crop: {
          type: Schema.Types.ObjectId,
          ref: 'Crop',
        },
        active: {
          type: Boolean,
        },
      },
    ],
    crop_size_list: {
      type: [
        {
          size: {
            type: String,
            default: '',
          },
          value: {
            type: String,
            default: '',
          },
          quantity: {
            type: Number,
            default: 1,
          },
          price: {
            type: Number,
            default: 0,
          },
          royalty: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: 'DRAFTS',
    },
  },
  { timestamps: true },
);

productSchema.index({ '$**': 'text' });
const Product = mongoose.model('Product', productSchema);

export default Product;
