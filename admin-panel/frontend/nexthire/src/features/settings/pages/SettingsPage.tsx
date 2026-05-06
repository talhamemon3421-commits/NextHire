import React, { useState, FormEvent, useEffect } from "react";
import { Loader2, CheckCircle2, Save, User as UserIcon, Palette, Building2, UserCircle2 } from "lucide-react";
import { env } from "@/shared/config/env";
import { updateEmployerProfile, getEmployerProfile, uploadEmployerAvatar, type UpdateEmployerProfilePayload } from "../../auth/api/employersApi";
import { getCompanyProfile, updateCompanyProfile, type CompanyProfile, type CompanyOffice } from "../../company/api/companyApi";
import { getStoredTheme, setTheme, type ThemeMode } from "@/shared/theme/theme";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Manage your professional account and company brand preferences.</p>
      </div>

      <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border bg-accent/30 p-2 gap-1">
          {[
            { id: "profile", label: "Profile Settings", icon: UserCircle2 },
            { id: "company", label: "Company Details", icon: Building2 },
            { id: "appearance", label: "Appearance", icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-10">
          {activeTab === "profile" && <ProfileSettingsTab />}
          {activeTab === "company" && <CompanySettingsTab />}
          {activeTab === "appearance" && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettingsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [password, setPassword] = useState("");

  const [isApproved, setIsApproved] = useState(false);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getEmployerProfile();
        const data = res.data;
        setName(data.name || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setProfilePicture(data.profilePicture || "");
        setIsApproved(data.isApproved || false);
        setEmail(data.email || "");
        setCreatedAt(data.createdAt || "");
      } catch (err: any) {
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingAvatar(true);
    setError(null);
    try {
      const res = await uploadEmployerAvatar(file);
      setProfilePicture(res.data.profilePicture);
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload: UpdateEmployerProfilePayload = {
        name,
        phone: phone || null,
        location: location || null,
        profilePicture: profilePicture || null,
      };
      if (password) payload.password = password;
      await updateEmployerProfile(payload);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="mb-8 p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl text-sm font-bold border border-emerald-500/20 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 bg-accent/20 rounded-[2rem] border border-border shadow-inner grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Account Email</div>
            <div className="text-sm font-bold truncate">{email}</div>
          </div>
          <div className="flex flex-col md:items-end">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Verification Status</div>
            {isApproved ? (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Approved</span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest inline-flex">Pending</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-accent border border-border overflow-hidden shrink-0 shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              {profilePicture ? (
                <img src={profilePicture.startsWith('/api') ? `${env.apiBaseUrl}${profilePicture.substring(4)}` : profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-muted-foreground/30" />
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all border-2 border-card">
              <input type="file" accept="image/*" onChange={handleAvatarSelect} disabled={isUploadingAvatar} className="hidden" />
              <Palette className="w-4 h-4" />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Profile Identity</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Upload a professional headshot. JPEG or PNG, max 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Update Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
              placeholder="Leave blank to keep current"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-border flex items-center justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

function AppearanceTab() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());
  const apply = (m: ThemeMode) => {
    setMode(m);
    setTheme(m);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">Theme Preferences</h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">Select your preferred interface aesthetic for this session.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            { id: "light", title: "Light", desc: "Classic clarity", icon: UserCircle2 },
            { id: "dark", title: "Dark", desc: "Night focus", icon: UserCircle2 },
            { id: "system", title: "System", desc: "OS sync", icon: UserCircle2 },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => apply(opt.id)}
              className={cn(
                "group relative rounded-[2rem] border-2 p-6 text-left transition-all duration-300",
                mode === opt.id
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-border hover:border-primary/30 hover:bg-accent/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                mode === opt.id ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground group-hover:text-primary"
              )}>
                {opt.id === 'light' ? <Palette className="w-5 h-5" /> : opt.id === 'dark' ? <Palette className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
              </div>
              <div className="text-sm font-black uppercase tracking-widest">{opt.title}</div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1 tracking-tighter">{opt.desc}</div>
              {mode === opt.id && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompanySettingsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState<CompanyProfile | null>(null);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logo, setLogo] = useState("");
  const [banner, setBanner] = useState("");
  const [favicon, setFavicon] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [secondaryColor, setSecondaryColor] = useState("#1D4ED8");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWebsite, setContactWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [x, setX] = useState("");
  const [hqAddress, setHqAddress] = useState("");
  const [hqCity, setHqCity] = useState("");
  const [hqState, setHqState] = useState("");
  const [hqCountry, setHqCountry] = useState("");
  const [hqPostalCode, setHqPostalCode] = useState("");
  const [offices, setOffices] = useState<CompanyOffice[]>([]);
  const [foundedYear, setFoundedYear] = useState<string>("");
  const [description, setDescription] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [valuesInput, setValuesInput] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const res = await getCompanyProfile();
        const data = res.data;
        setCompany(data);
        setName(data.name || "");
        setShortName(data.shortName || "");
        setTagline(data.tagline || "");
        setLogo(data.branding?.logo || "");
        setBanner(data.branding?.banner || "");
        setFavicon(data.branding?.favicon || "");
        setPrimaryColor(data.branding?.primaryColor || "#0F172A");
        setSecondaryColor(data.branding?.secondaryColor || "#1D4ED8");
        setContactEmail(data.contact?.email || "");
        setContactPhone(data.contact?.phone || "");
        setContactWebsite(data.contact?.website || "");
        setLinkedin(data.socialLinks?.linkedin || "");
        setFacebook(data.socialLinks?.facebook || "");
        setInstagram(data.socialLinks?.instagram || "");
        setYoutube(data.socialLinks?.youtube || "");
        setX(data.socialLinks?.x || "");
        setHqAddress(data.headquarters?.address || "");
        setHqCity(data.headquarters?.city || "");
        setHqState(data.headquarters?.state || "");
        setHqCountry(data.headquarters?.country || "");
        setHqPostalCode(data.headquarters?.postalCode || "");
        setOffices(Array.isArray(data.offices) ? data.offices : []);
        setFoundedYear(data.about?.foundedYear ? String(data.about.foundedYear) : "");
        setDescription(data.about?.description || "");
        setMission(data.about?.mission || "");
        setVision(data.about?.vision || "");
        setValues(Array.isArray(data.about?.values) ? data.about.values : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load company profile.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const addOffice = () => setOffices((prev) => [...prev, { address: "", city: "", state: "", country: "" }]);
  const updateOffice = (idx: number, patch: Partial<CompanyOffice>) => setOffices((prev) => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  const removeOffice = (idx: number) => setOffices((prev) => prev.filter((_, i) => i !== idx));
  const addValue = () => {
    const v = valuesInput.trim();
    if (!v) return;
    setValues((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setValuesInput("");
  };
  const removeValue = (v: string) => setValues((prev) => prev.filter((x) => x !== v));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        name, shortName, tagline,
        branding: { logo, banner, favicon, primaryColor, secondaryColor },
        contact: { email: contactEmail, phone: contactPhone, website: contactWebsite },
        socialLinks: { linkedin, facebook, instagram, youtube, x },
        headquarters: { address: hqAddress, city: hqCity, state: hqState, country: hqCountry, postalCode: hqPostalCode },
        offices,
        about: { foundedYear: foundedYear ? Number(foundedYear) : null, description, mission, vision, values },
      };
      const res = await updateCompanyProfile(payload);
      setCompany(res.data);
      setIsSuccess(true);
      window.dispatchEvent(new Event("nexthire:companyProfileUpdated"));
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (e: any) {
      setError(e?.message || "Failed to update company profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading company...</div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-500/20 shadow-sm animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
      {isSuccess && (
        <div className="mb-8 p-5 bg-emerald-500/10 text-emerald-500 rounded-2xl text-sm font-bold border border-emerald-500/20 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Company profile updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <section className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Identity & Branding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-accent/20 p-6 rounded-[2rem] border border-border">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Official Name</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Market Short Name</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={shortName} onChange={(e) => setShortName(e.target.value)} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Brand Tagline</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Logo URL</label>
              <input className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Banner URL</label>
              <input className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            Core Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-accent/20 p-6 rounded-[2rem] border border-border">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Public Email</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Public Phone</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Official Website</label>
              <input className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" value={contactWebsite} onChange={(e) => setContactWebsite(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              Global Offices
            </h3>
            <Button type="button" onClick={addOffice} variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-primary/20 hover:bg-primary/5">
              + Add Office
            </Button>
          </div>
          <div className="space-y-4">
            {offices.map((o, idx) => (
              <div key={idx} className="bg-accent/20 rounded-[2rem] p-6 border border-border relative group">
                <button type="button" onClick={() => removeOffice(idx)} className="absolute top-4 right-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                  Remove
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Street Address</label>
                    <input className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm font-bold" value={o.address || ""} onChange={(e) => updateOffice(idx, { address: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">City</label>
                    <input className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm font-bold" value={o.city || ""} onChange={(e) => updateOffice(idx, { city: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Country</label>
                    <input className="w-full bg-card border border-border rounded-xl px-4 py-2 text-sm font-bold" value={o.country || ""} onChange={(e) => updateOffice(idx, { country: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="pt-8 border-t border-border flex items-center justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Sync All Data
          </Button>
        </div>
      </form>
    </div>
  );
}
