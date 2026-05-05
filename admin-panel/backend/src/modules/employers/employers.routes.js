import { Router } from 'express';
import { validate } from '../../middlewares/validationMiddleware.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireVerifiedEmployer } from '../../middlewares/roleMiddleware.js';
import { upload } from '../../middlewares/uploadMiddleware.js';
import { updateEmployerProfileSchema } from './employers.validation.js';
import { getProfileController, updateProfileController, uploadAvatarController, getAvatarImageController } from './employers.controller.js';

const router = Router();

// ─── EMPLOYER PROFILE ROUTES ────────────────────────────────────────────

// Get current employer profile
router.get(
  '/me',
  authMiddleware,
  requireVerifiedEmployer,
  getProfileController
);

// Update current employer profile (partial update)
router.patch(
  '/me',
  authMiddleware,
  requireVerifiedEmployer,
  validate(updateEmployerProfileSchema),
  updateProfileController
);

// Upload avatar
router.post(
  '/me/avatar',
  authMiddleware,
  requireVerifiedEmployer,
  upload.single('avatar'),
  uploadAvatarController
);

// Proxy avatar images from S3 to avoid 403 Forbidden errors when NO public URL is set
router.use('/avatar', getAvatarImageController);

export default router;
