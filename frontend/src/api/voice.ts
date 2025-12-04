import api from "./axiosClient";

export const processVoiceCommand = (text: string) =>
  api.post("/voice", { text });
