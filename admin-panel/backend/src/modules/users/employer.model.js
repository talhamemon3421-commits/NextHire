import { Schema} from "mongoose";
import BaseUser from "./baseUser.model.js";

const employerSchema = new Schema({
  isApproved: { type: Boolean, default: false },
  companyName: { type: String, trim: true },
  companyWebsite: { type: String, trim: true },
  industry: { type: String, trim: true }
});

const Employer = BaseUser.discriminator('Employer', employerSchema);

export default Employer;