import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // לדוגמה: http://localhost:5000
});

export default api;
