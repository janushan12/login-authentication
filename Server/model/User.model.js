import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a unique username'],
    unique: [true, 'Username Exist'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    unique: false,
  },
  email: {
    type: String,
    required: [true, 'Please provide a unique email'],
    unique: [true, 'Email Already exist'],
  },
  firstname: { type: String },
  lastname: { type: String },
  mobile: { type: Number },
  profile: { type: String },
});

export default mongoose.model.Users || mongoose.model('User', UserSchema);
