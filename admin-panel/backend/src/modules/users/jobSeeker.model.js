import { Schema} from "mongoose";
import BaseUser from "./baseUser.model.js";

const jobSeekerSchema = new Schema({
  skills: {
    type: [String],
    default: [],
    validate: v => v.length <= 20
  },

  bio: { type: String, default: null },

  linkedIn: String,
  github: String,
  portfolio: String,
});

const JobSeeker = BaseUser.discriminator('JobSeeker', jobSeekerSchema);

export default JobSeeker;