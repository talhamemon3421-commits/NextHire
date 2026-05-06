import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const officeSchema = new Schema(
  {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
  },
  { _id: false }
);

const companyProfileSchema = new Schema(
  {
    key: { type: String, unique: true, required: true, default: 'default' },

    name: { type: String, default: '' },
    shortName: { type: String, default: '' },
    tagline: { type: String, default: '' },

    branding: {
      logo: { type: String, default: '' },
      banner: { type: String, default: '' },
      favicon: { type: String, default: '' },
      primaryColor: { type: String, default: '#0F172A' },
      secondaryColor: { type: String, default: '#1D4ED8' },
    },

    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    socialLinks: {
      linkedin: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      x: { type: String, default: '' },
    },

    headquarters: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },

    offices: { type: [officeSchema], default: [] },

    about: {
      foundedYear: { type: Number, default: null },
      description: { type: String, default: '' },
      mission: { type: String, default: '' },
      vision: { type: String, default: '' },
      values: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

companyProfileSchema.index({ key: 1 }, { unique: true });

const CompanyProfile = model('CompanyProfile', companyProfileSchema);
export default CompanyProfile;

