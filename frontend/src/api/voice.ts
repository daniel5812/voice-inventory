import api from "./axiosClient";

export async function sendVoiceCommand(text: string) {
  try {
    const response = await api.post("/voice/command", { text });
    return response.data;
  } catch (error: any) {
    console.error("Voice command error:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Server error",
    };
  }
}
