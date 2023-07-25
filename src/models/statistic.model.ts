import mongoose, { Schema } from 'mongoose';

const statisticSchema = new mongoose.Schema(
    {
        creator_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        visitors: {
            type: Number,
            default: 0,
        },
        sales: {
            type: Number,
            default: 0,
        },
        royalties: {
            type: Number,
            default: 0,
        },
        tips: {
            type: Number,
            default: 0,
        },
        date: {
            type: Date,
            default: '',
        }
    },
    { timestamps: true },
);

const Statistic = mongoose.model('Statistic', statisticSchema);

export default Statistic;
