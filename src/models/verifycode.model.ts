import mongoose from 'mongoose';
import { VERIFY_CODE_TYPES } from '~/helpers/constants.helper';
const verifyCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
    },
    code: { type: Number, require: true },
    nb_tries: { type: Number, default: 0, require: true },
    lastTryAt: { type: Date, require: true },
    nb_resends: { type: Number, default: 0 },
    lastResendAt: { type: Date },
    type: {
      type: String,
      enum: Object.values(VERIFY_CODE_TYPES),
      default: VERIFY_CODE_TYPES.VALIDATE_EMAIL,
      primaryKey: true,
      require: true
    }
  },
  { timestamps: true },
);

const VerifyCode = mongoose.model('verifyCode', verifyCodeSchema);

export default VerifyCode;
