import { catchAsync } from '../../utils/catchAsync.js';
import { getProfileService, updateProfileService } from './employers.service.js';
import { uploadProfilePicture, fetchProfilePicture } from '../../services/r2.service.js';
import AppError from '../../utils/AppError.js';

// ─── GET EMPLOYER PROFILE ───────────────────────────────────────────────
export const getProfileController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;

  const employer = await getProfileService(employerId);

  res.status(200).json({
    success: true,
    message: 'Employer profile retrieved successfully',
    data: employer,
  });
});

// ─── UPDATE EMPLOYER PROFILE ────────────────────────────────────────────
export const updateProfileController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;
  const updateData = req.body;

  const updatedEmployer = await updateProfileService(employerId, updateData);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedEmployer,
  });
});

// ─── UPLOAD AVATAR ──────────────────────────────────────────────────────
export const uploadAvatarController = catchAsync(async (req, res) => {
  const employerId = req.user.userId;

  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  // Upload to R2
  const imageUrl = await uploadProfilePicture(
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  // Update employer profile with the new imageUrl
  const updatedEmployer = await updateProfileService(employerId, { profilePicture: imageUrl });

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: updatedEmployer,
  });
});

// ─── GET AVATAR IMAGE PROXY ─────────────────────────────────────────────
export const getAvatarImageController = catchAsync(async (req, res, next) => {
  if (req.method !== 'GET') return next();

  // With router.use('/avatar', ...), req.path contains the remainder string
  const fileKey = decodeURIComponent(req.path.slice(1));

  if (!fileKey) {
    throw new AppError('File key is required', 400);
  }

  try {
    const { buffer, mimetype } = await fetchProfilePicture(fileKey);
    res.set('Content-Type', mimetype);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    res.send(buffer);
  } catch (error) {
    throw new AppError('Image not found or inaccessible', 404);
  }
});
