import mongoose, { Schema } from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // sub_name: {
    //     type: String,
    //     default: '',
    // },
    // sub_img: {
    //     type: String,
    //     default: '',
    // }, 
    // description: {
    //   type: String,
    //   default: '',
    // }    
  },
  { timestamps: true },
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
