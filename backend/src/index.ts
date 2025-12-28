import express from "express";
import cors from "cors";
import prisma from "./prisma";
import itemsRouter from "./routes/items";
import movementsRouter from "./routes/movements";
import voiceRouter from "./routes/voice";
import { startVoiceAgent } from "./services/openaiVoiceAgent";
import voiceAgentRoutes from "./routes/voiceAgent";
import profileRouter from "./routes/users";

import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/items", itemsRouter);
app.use("/api/movements", movementsRouter);
app.use("/api/voice", voiceRouter);
app.use("/api/me", profileRouter);

// ROOT TEST
app.get("/", (req, res) => {
  res.send("Voice Inventory API is running");
});

const PORT = process.env.PORT || 5000;

// 🔥 הפעלת מודל הקול של OpenAI כאשר השרת עולה
app.use("/voice-agent", voiceAgentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});