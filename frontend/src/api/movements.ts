import api from "./axiosClient";
import axios from "axios";

const API_URL = "http://localhost:5000";


export const getMovements = (limit = 50) =>
  api.get(`/movements?limit=${limit}`);

export const createMovement = (data: any) =>
  api.post("/movements", data);

// פונקציה לעיבוד פקודות קוליות עם Groq
export const processVoiceCommand = (text: string) =>
  api.post("/voice-command", { text });

export async function sendVoiceCommand(data: { rawText: string }) {
  const res = await axios.post(`${API_URL}/voice/command`, data);
  return res.data;
}