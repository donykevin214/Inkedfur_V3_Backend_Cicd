import mongoose, { Schema } from 'mongoose';
import { DEFAULT_PRODUCT_SIZE, PRODUCT_SELL_TYPE } from '~/helpers/constants.helper';

const agreementSchema = new mongoose.Schema(
    {
        parent: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        slug: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
    },
    { timestamps: true },
);

const Agreement = mongoose.model('Agreement', agreementSchema);

export default Agreement;
