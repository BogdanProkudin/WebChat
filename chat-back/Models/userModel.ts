import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },

  { timestamps: true }
);

export const UserModel = mongoose.model('User', UserSchema);
