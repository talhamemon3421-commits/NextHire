import { Schema, model } from "mongoose";

const baseUserSchema = new Schema({
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /.+\@.+\..+/
  },

  password: { type: String, required: true },

  profilePicture: String,

  phone: { type: String, unique: true, sparse: true, default: null },

  location: { type: String, default: null },

  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  refreshToken: String,

}, {
  timestamps: true,
  discriminatorKey: '__t'
});

const BaseUser = model('User', baseUserSchema);

export default BaseUser;