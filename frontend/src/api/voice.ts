import axios from "./axiosClient";

export async function sendVoiceCommand(text: string) {
  const response = await axios.post("/voice/command", { text });
  return response.data;
}
