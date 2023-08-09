import mongoose, { Schema } from 'mongoose';

const typeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      default: '0-deleted',
    },
    import_type: {
      type: String,
      default: 'CSV',
    },
    description: {
      type: String,
      default: '',
    },
    weight: {
      type: Number,
      default: '',
    },
    printable: {
      type: Boolean,
      default: false,
    },
    backorderable: {
      type: Boolean,
      default: false,
    },
    outsourced: {
      type: Boolean,
      default: false,
    },
    selfServices: {
      type: Boolean,
      default: false,
    },
    multiSubmissionOption: {
      type: Boolean,
      default: false,
    },
    royalties: {
      type: Number,
      default: 0,
    },
    navigation: {
      type: Boolean,
      default: false,
    },
    product_image: {
      type: String,
      default: '',
    },
    size_option: [
      {
        type: String,
      },
    ],
    other_fields: [
      {
        name: {
          type: String,
        },
        values: [
          {
            size_id: {
              type: String,
            },
            value: {
              type: String,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

const Type = mongoose.model('Type', typeSchema);

export default Type;
