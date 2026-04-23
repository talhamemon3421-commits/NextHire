import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const employerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      default: 'employer',
      immutable: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'Pakistan',
    },
    industry: {
      type: String,
      trim: true,
    },
    companyWebsite: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before save
employerSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to compare passwords
employerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Employer = mongoose.model('Employer', employerSchema);

export default Employer;
