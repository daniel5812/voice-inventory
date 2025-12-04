import express from "express";
import prisma from "./prisma";
import itemsRouter from "./routes/items";
import movementsRouter from "./routes/movements";
import voiceRouter from "./routes/voice";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/items", itemsRouter);
app.use("/movements", movementsRouter);
app.use("/voice-command", voiceRouter);


app.get("/", (req, res) => {
  res.send("Voice Inventory API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
