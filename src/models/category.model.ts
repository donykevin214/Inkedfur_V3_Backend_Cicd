import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    category_name: {
        type: String,
        default: '',
    },
    parent: {
        type: String,
        default: 'root',
    }
  },
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
