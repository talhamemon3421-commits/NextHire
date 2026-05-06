import React, { useState, FormEvent, useEffect } from "react";
import { X, Loader2, CheckCircle2, Save, User as UserIcon, ShieldCheck, Mail, Calendar, MapPin, Phone } from "lucide-react";
import { env } from "@/shared/config/env";
import { updateEmployerProfile, getEmployerProfile, uploadEmployerAvatar, type UpdateEmployerProfilePayload } from "../../auth/api/employersApi";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";

interface EditEmployerProfileModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export function EditEmployerProfileModal({ onClose, onSaved }: EditEmployerProfileModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [password, setPassword] = useState("");
  
  // Read-only state
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

      if (password) {
        payload.password = password;
      }

      await updateEmployerProfile(payload);
      setIsSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative bg-card rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border/50">

        {/* Loading Overlay */}
        {(isSubmitting || isLoading) && !isSuccess && (
          <div className="absolute inset-0 z-[110] bg-background/90 backdrop-blur-lg flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground uppercase tracking-[0.2em]">
              {isLoading ? "Synchronizing Data" : "Updating Identity"}
            </h3>
          </div>
        )}

        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-[110] bg-emerald-500 flex flex-col items-center justify-center text-white animate-in zoom-in duration-500">
            <CheckCircle2 className="w-20 h-20 mb-6 animate-bounce" />
            <h3 className="text-3xl font-black tracking-tighter">PROFILE UPDATED!</h3>
            <p className="text-lg font-medium mt-2 opacity-90">Closing secure session...</p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border/50 bg-accent/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Employer Profile</h2>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-0.5">Secure Account Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-muted-foreground hover:bg-accent rounded-2xl transition-all duration-300 hover:rotate-90">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold border border-red-500/20 animate-in shake duration-500">
              {error}
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Account summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-accent/20 rounded-[2rem] border border-border/50 shadow-inner group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Account Email</span>
                </div>
                <div className="text-sm font-bold truncate ml-7">{email}</div>
              </div>
              
              <div className="p-5 bg-accent/20 rounded-[2rem] border border-border/50 shadow-inner flex flex-col justify-between group hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Verification</span>
                  </div>
                  {isApproved ? (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-lg border border-amber-500/20 uppercase tracking-widest">Pending</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Calendar className="w-4 h-4 text-muted-foreground/50" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Since {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-card border border-border overflow-hidden shrink-0 shadow-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
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
                  <Save className="w-4 h-4" />
                </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold">Profile Identity</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Upload a professional headshot. JPEG or PNG, max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserIcon className="w-3 h-3 text-primary" /> Employer Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-primary" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-primary" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="e.g. Islamabad, Pakistan"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Security Access
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full bg-accent/30 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm outline-none"
                  placeholder="Enter new 8+ character password"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-end gap-4 bg-accent/30">
          <button
            onClick={onClose}
            type="button"
            className="w-full sm:w-auto px-8 py-4 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-accent transition-colors"
          >
            DISCARD
          </button>
          <Button
            form="edit-profile-form"
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto h-auto py-4 px-10 rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all border-0"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            UPDATE ACCOUNT
          </Button>
        </div>

      </div>
    </div>
  );
}
