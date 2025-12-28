// src/api/voice.ts
import api from "./axiosClient";
import type { Item } from "../types/Item";
import type { Movement } from "../types/Movement";

export type VoiceCommandResponse = {
  success: boolean;
  message: string;
  item?: Item;
  movement?: Movement;
};

export async function sendVoiceCommand(text: string): Promise<VoiceCommandResponse> {
  try {
    const res = await api.post("/voice/command", { text });
    const data = res.data;

    return {
      success: Boolean(data?.success),
      message: data?.message ?? "Voice command finished",
      item: data?.item,
      movement: data?.movement,
    };
  } catch (err: any) {
    const msg =
      err?.response?.data?.error ||
      err?.message ||
      "Voice command failed";

    return {
      success: false,
      message: msg,
    };
  }
}
