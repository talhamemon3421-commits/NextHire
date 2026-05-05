import { apiFetch } from "../../../shared/lib/http";

export interface ChatMessage {
  role: "user" | "model";
  parts: any[]; // The Gemini parts array
}

export interface ChatResponse {
  success: boolean;
  data: {
    text: string;
    history: ChatMessage[];
  };
}

export async function sendChatMessage(history: ChatMessage[]) {
  return apiFetch<ChatResponse>("/chat", {
    method: "POST",
    json: { history },
  });
}
