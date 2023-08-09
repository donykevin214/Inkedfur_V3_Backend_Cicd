import mongoose, { Schema } from 'mongoose';

const typeSizeSchema = new mongoose.Schema(
  {
    type_id: {
      type: Schema.Types.ObjectId,
      ref: 'type',
      default: '',
    },
    sku_suffix: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    weight: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: '',
    },
    royalty: {
      type: Number,
      default: '',
    },
  },
  { timestamps: true },
);
function addDynamicField(fieldName: string) {
  console.log('fieldName: ', fieldName);
  typeSizeSchema.add({ new: String });
  console.log('schema: ', typeSizeSchema.obj);
  const TypeSize = mongoose.model('Typesize', typeSizeSchema);
  TypeSize.init();
}
const TypeSize = mongoose.model('Typesize', typeSizeSchema);

export { TypeSize, addDynamicField };
