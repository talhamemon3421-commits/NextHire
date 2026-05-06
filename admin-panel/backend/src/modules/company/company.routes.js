import { Router } from 'express';
import { validate } from '../../middlewares/validationMiddleware.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { requireVerifiedEmployer } from '../../middlewares/roleMiddleware.js';
import { getCompanyProfileController, updateCompanyProfileController } from './company.controller.js';
import { updateCompanyProfileSchema } from './company.validation.js';

const router = Router();

// Public read (for login page / branding)
router.get('/profile', getCompanyProfileController);

// Protected update (employer)
router.patch(
  '/profile',
  authMiddleware,
  requireVerifiedEmployer,
  validate(updateCompanyProfileSchema),
  updateCompanyProfileController
);

export default router;

