import mongoose, { InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Roles, USER_STATUS } from '~/helpers/constants.helper';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      default: '',
    },
    firstname: {
      type: String,
      default: '',
    },
    lastname: {
      type: String,
      default: '',
    },
    birthday: {
      type: Date,
      default: '',
    },
    roles: {
      type: String,
      default: Roles.CUSTOMER,
      enum: Object.values(Roles),
    },
    description: {
      type: String,
      default: '',
    },
    social: {
      type: [
        {
          social_name: {
            type: String,
            default: '',
          },
          url: {
            type: String,
            default: '',
          }
        }
      ],
      default: [],
    },
    galleryLinks: {
      type: Array,
      default: []
    },
    signature: {
      type: String,
      default: '',
    },
    signature_date: {
      type: Date,
      default: '',
    },
    profile_img: {
      type: String,
      default: '',
    },
    banner_img: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: 'PENDING',
    },
    paypal: {
      type: String,
      default: '',
    },
    tos_href: {
      type: String,
      default: '',
    },
    ip_address: {
      type: String,
    }
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

userSchema.methods.correctPassword = async function (password: string, old_password: string) {
  const bool = await bcrypt.compare(password, old_password);
  return bool;
};

declare interface IUser extends InferSchemaType<typeof userSchema> {
  correctPassword(password: string, old_password: string): boolean
}
const User = mongoose.model<IUser>('User', userSchema);

export default User;
