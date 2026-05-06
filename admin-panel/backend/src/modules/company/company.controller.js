import { catchAsync } from '../../utils/catchAsync.js';
import { getCompanyProfileService, updateCompanyProfileService } from './company.service.js';

export const getCompanyProfileController = catchAsync(async (_req, res) => {
  const profile = await getCompanyProfileService();

  res.status(200).json({
    success: true,
    message: 'Company profile retrieved successfully',
    data: profile,
  });
});

export const updateCompanyProfileController = catchAsync(async (req, res) => {
  const patch = req.validatedData || req.body;
  const updated = await updateCompanyProfileService(patch);

  res.status(200).json({
    success: true,
    message: 'Company profile updated successfully',
    data: updated,
  });
});

