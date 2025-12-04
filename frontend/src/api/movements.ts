import api from "./axiosClient";

export const getMovements = (limit = 50) =>
  api.get(`/movements?limit=${limit}`);

export const createMovement = (data: any) =>
  api.post("/movements", data);

// פונקציה לעיבוד פקודות קוליות עם Groq
export const processVoiceCommand = (text: string) =>
  api.post("/voice-command", { text });