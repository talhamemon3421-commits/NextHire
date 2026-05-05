import React, { useState, FormEvent, useEffect } from "react";
import { X, Loader2, CheckCircle2, Save, User as UserIcon } from "lucide-react";
import { env } from "@/shared/config/env";
import { updateEmployerProfile, getEmployerProfile, uploadEmployerAvatar, type UpdateEmployerProfilePayload } from "../../auth/api/employersApi";

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
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState("");
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
        setCompanyName(data.companyName || "");
        setCompanyWebsite(data.companyWebsite || "");
        setIndustry(data.industry || "");
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Loading Overlay */}
        {(isSubmitting || isLoading) && !isSuccess && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur flex flex-col items-center justify-center rounded-xl">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <div className="text-lg font-bold text-slate-800">
              {isLoading ? "Loading profile..." : "Saving changes..."}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage your employer account details.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <span className="font-bold">Profile updated successfully!</span>
              </div>
            </div>
          )}

          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Read-only badges row */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1">Account Email</div>
                <div className="text-xs text-slate-500">{email}</div>
              </div>
              <div className="flex flex-col md:items-end justify-center">
                <div className="text-sm font-bold text-slate-700 mb-1">Status</div>
                {isApproved ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 w-fit"><CheckCircle2 className="w-3.5 h-3.5" /> Approved</span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 inline-flex w-fit">Pending Approval</span>
                )}
              </div>
              
              <div>
                <div className="text-sm font-bold text-slate-700 mb-1">Industry</div>
                <div className="text-xs text-slate-500">{industry || "N/A"}</div>
              </div>
              <div className="md:text-right">
                <div className="text-sm font-bold text-slate-700 mb-1">Member Since</div>
                <div className="text-xs text-slate-500">
                  {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 group flex items-center justify-center">
                {profilePicture ? (
                  <img src={profilePicture.startsWith('/api') ? `${env.apiBaseUrl}${profilePicture.substring(4)}` : profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-slate-300" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  disabled={isUploadingAvatar}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 transition cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Employer Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="+92 300 1234567"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Islamabad, Pakistan"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">New Password (optional)</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Enter new 8+ character password"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:underline transition"
          >
            Cancel
          </button>
          <button
            form="edit-profile-form"
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>

      </div>
    </div>
  );
}
