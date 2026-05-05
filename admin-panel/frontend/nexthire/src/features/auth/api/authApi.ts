import { apiFetch } from "@/shared/lib/http";

export type LoginRequest = {
  email: string;
  password: string;
  role: "employer";
};

export type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    user: unknown;
    accessToken: string;
  };
};

export async function login(req: LoginRequest) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    json: req
  });
}

