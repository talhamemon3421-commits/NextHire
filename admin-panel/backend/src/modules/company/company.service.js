import CompanyProfile from './company.model.js';
import { COMPANY_PROFILE } from '../../constants/companydetails.js';

const DEFAULT_KEY = 'default';

const normalize = (profile) => ({
  key: DEFAULT_KEY,
  name: profile?.name || '',
  shortName: profile?.shortName || '',
  tagline: profile?.tagline || '',
  branding: {
    logo: profile?.branding?.logo || '',
    banner: profile?.branding?.banner || '',
    favicon: profile?.branding?.favicon || '',
    primaryColor: profile?.branding?.primaryColor || '#0F172A',
    secondaryColor: profile?.branding?.secondaryColor || '#1D4ED8',
  },
  contact: {
    email: profile?.contact?.email || '',
    phone: profile?.contact?.phone || '',
    website: profile?.contact?.website || '',
  },
  socialLinks: {
    linkedin: profile?.socialLinks?.linkedin || '',
    facebook: profile?.socialLinks?.facebook || '',
    instagram: profile?.socialLinks?.instagram || '',
    youtube: profile?.socialLinks?.youtube || '',
    x: profile?.socialLinks?.x || '',
  },
  headquarters: {
    address: profile?.headquarters?.address || '',
    city: profile?.headquarters?.city || '',
    state: profile?.headquarters?.state || '',
    country: profile?.headquarters?.country || '',
    postalCode: profile?.headquarters?.postalCode || '',
  },
  offices: Array.isArray(profile?.offices) ? profile.offices : [],
  about: {
    foundedYear: profile?.about?.foundedYear ?? null,
    description: profile?.about?.description || '',
    mission: profile?.about?.mission || '',
    vision: profile?.about?.vision || '',
    values: Array.isArray(profile?.about?.values) ? profile.about.values : [],
  },
});

export async function getCompanyProfileService() {
  let doc = await CompanyProfile.findOne({ key: DEFAULT_KEY }).lean();
  if (!doc) {
    const seeded = normalize(COMPANY_PROFILE);
    doc = (await CompanyProfile.create(seeded)).toObject();
  }
  return doc;
}

export async function updateCompanyProfileService(patch) {
  // merge: shallow merge + deep merge for nested groups
  const existing = await getCompanyProfileService();

  const merged = {
    ...existing,
    ...patch,
    branding: { ...existing.branding, ...(patch.branding || {}) },
    contact: { ...existing.contact, ...(patch.contact || {}) },
    socialLinks: { ...existing.socialLinks, ...(patch.socialLinks || {}) },
    headquarters: { ...existing.headquarters, ...(patch.headquarters || {}) },
    about: { ...existing.about, ...(patch.about || {}) },
  };

  // if arrays provided, replace them
  if (patch.offices) merged.offices = patch.offices;
  if (patch.about?.values) merged.about.values = patch.about.values;

  const updated = await CompanyProfile.findOneAndUpdate(
    { key: DEFAULT_KEY },
    normalize(merged),
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return updated;
}

