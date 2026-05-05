import { apiFetch } from "@/shared/lib/http";

export type UpdateEmployerProfilePayload = {
  name?: string;
  phone?: string | null;
  location?: string | null;
  profilePicture?: string | null;
  password?: string;
};

export async function getEmployerProfile() {
  return apiFetch<{ success: boolean; message: string; data: any }>("/employers/me");
}

export async function updateEmployerProfile(data: UpdateEmployerProfilePayload) {
  return apiFetch<{ success: boolean; message: string; data: any }>("/employers/me", {
    method: "PATCH",
    json: data,
  });
}

import { env } from "@/shared/config/env";

export async function uploadEmployerAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  
  const res = await fetch(`${env.apiBaseUrl}/employers/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const parsed = await res.json();
  if (!res.ok) throw new Error(parsed.message || "Failed to upload avatar");
  return parsed;
}
