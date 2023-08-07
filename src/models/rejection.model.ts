import mongoose from 'mongoose';

const rejectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
    },
    { timestamps: true },
);

const Rejection = mongoose.model('Rejection', rejectionSchema);

export default Rejection;
