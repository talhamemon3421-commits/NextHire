import Employer from '../users/employer.model.js';
import AppError from '../../utils/AppError.js';
import bcrypt from 'bcrypt';

// ─── GET EMPLOYER PROFILE ───────────────────────────────────────────────
export const getProfileService = async (employerId) => {
  const employer = await Employer.findById(employerId)
    .select('-__v');

  if (!employer) {
    throw new AppError('Employer not found', 404, 'EMPLOYER_NOT_FOUND');
  }

  return employer;
};

// ─── UPDATE EMPLOYER PROFILE ────────────────────────────────────────────
export const updateProfileService = async (employerId, updateData) => {
  // Guard against empty payloads
  if (!updateData || Object.keys(updateData).length === 0) {
    throw new AppError('No fields provided to update', 400, 'EMPTY_UPDATE_PAYLOAD');
  }

  // Ensure employer exists
  const employer = await Employer.findById(employerId);
  if (!employer) {
    throw new AppError('Employer not found', 404, 'EMPLOYER_NOT_FOUND');
  }

  // If updating password, hash it first
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 12);
  }

  // Use findByIdAndUpdate for partial updates, keeping validators
  const updatedEmployer = await Employer.findByIdAndUpdate(
    employerId,
    updateData,
    { new: true, runValidators: true }
  ).select('-__v');

  return updatedEmployer;
};
