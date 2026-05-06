import { apiFetch } from "@/shared/lib/http";

export interface CompanyOffice {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface CompanyProfile {
  key: string;
  name: string;
  shortName: string;
  tagline: string;
  branding: {
    logo: string;
    banner: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
  };
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  socialLinks: {
    linkedin: string;
    facebook: string;
    instagram: string;
    youtube: string;
    x: string;
  };
  headquarters: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  offices: CompanyOffice[];
  about: {
    foundedYear: number | null;
    description: string;
    mission: string;
    vision: string;
    values: string[];
  };
}

export type UpdateCompanyProfilePayload = Partial<
  Omit<CompanyProfile, "key"> & {
    branding: Partial<CompanyProfile["branding"]>;
    contact: Partial<CompanyProfile["contact"]>;
    socialLinks: Partial<CompanyProfile["socialLinks"]>;
    headquarters: Partial<CompanyProfile["headquarters"]>;
    about: Partial<CompanyProfile["about"]>;
  }
>;

export async function getCompanyProfile() {
  return apiFetch<{ success: boolean; message: string; data: CompanyProfile }>(
    "/company/profile"
  );
}

export async function updateCompanyProfile(payload: UpdateCompanyProfilePayload) {
  return apiFetch<{ success: boolean; message: string; data: CompanyProfile }>(
    "/company/profile",
    { method: "PATCH", json: payload }
  );
}

