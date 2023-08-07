import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      default: '',
    },
    nsfw: {
      type: Boolean,
      default: false,
    },
    children: {
      type: String,
      default: '',
    },
    prints: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
