import express from "express";
import cors from "cors";
import prisma from "./prisma";
import itemsRouter from "./routes/items";
import movementsRouter from "./routes/movements";
import voiceRouter from "./routes/voice";
import { startVoiceAgent } from "./services/openaiVoiceAgent";

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/items", itemsRouter);
app.use("/movements", movementsRouter);
app.use("/api/voice", voiceRouter);

// ROOT TEST
app.get("/", (req, res) => {
  res.send("Voice Inventory API is running");
});

const PORT = process.env.PORT || 5000;

// 🔥 הפעלת מודל הקול של OpenAI כאשר השרת עולה
startVoiceAgent();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
