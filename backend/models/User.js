const { Schema, model } = require('mongoose');

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
  discriminatorKey: '__t' // [cite: 192]
});

const BaseUser = model('User', baseUserSchema);

const JobSeeker = BaseUser.discriminator('JobSeeker', new Schema({
  skills: {
    type: [String],
    default: [],
    validate: v => v.length <= 20 // [cite: 202]
  },
  bio: { type: String, default: null },
  linkedIn: String,
  github: String,
  portfolio: String,
}));

module.exports = { BaseUser, JobSeeker };