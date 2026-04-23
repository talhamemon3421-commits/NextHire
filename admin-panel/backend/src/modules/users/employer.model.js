import { Schema} from "mongoose";
import BaseUser from "./baseUser.model.js";

const employerSchema = new Schema({
  isApproved: { type: Boolean, default: false }
});

const Employer = BaseUser.discriminator('Employer', employerSchema);

export default Employer;