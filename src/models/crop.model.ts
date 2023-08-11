import mongoose, { Schema } from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type_id: {
      type: Schema.Types.ObjectId,
      ref: 'Type',
    },
    sizeList: [
      {
        size: {
          type: Schema.Types.ObjectId,
          ref: 'Typesize',
        },
      },
    ],
  },
  { timestamps: true },
);

cropSchema.index({ '$**': 'text' });
const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
