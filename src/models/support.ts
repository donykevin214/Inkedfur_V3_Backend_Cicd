import mongoose, { Schema } from 'mongoose';

const supportSchema = new mongoose.Schema(
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
        subjet: {
            type: String,
            default: '',
            required: true,
        },
        transactionId: {
            type: String,
            default: '',
        },
        status: {
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

const Support = mongoose.model('Support', supportSchema);

export default Support;
