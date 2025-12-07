import WebSocket from "ws";
import { OpenAI } from "openai";
import prisma from "../prisma";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// פונקציה שמתחברת למודל בזמן אמת
export function startVoiceAgent() {
  const ws = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
    {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      }
    }
  );

  ws.on("open", () => {
    console.log("🔊 Voice Agent connected to OpenAI Realtime API");
  });

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      // מחפשים Event של Intent
      if (data.type === "response.output_text.delta") {
        console.log("🗣️ MODEL SAID:", data.delta);
      }

      if (data.type === "response.reflection.delta") {
        // כאן נמצא ה־Intent המעובד
        const reflection = data.delta;
        console.log("INTENT RECEIVED:", reflection);

        const action = reflection.action;
        const item = reflection.itemName;
        const quantity = reflection.quantity;

        if (!action || !item || !quantity) return;

        // עדכון מלאי
        let dbItem = await prisma.item.findFirst({ where: { name: item } });

        if (!dbItem) {
          dbItem = await prisma.item.create({
            data: { name: item, quantity: 0 },
          });
        }

        let newQuantity =
          action === "add"
            ? dbItem.quantity + quantity
            : dbItem.quantity - quantity;

        if (newQuantity < 0) newQuantity = 0;

        await prisma.item.update({
          where: { id: dbItem.id },
          data: { quantity: newQuantity },
        });

        await prisma.movement.create({
          data: {
            itemId: dbItem.id,
            quantity,
            type: action,
            rawText: reflection.originalText,
          },
        });

        console.log(`Inventory updated: ${action} ${quantity} ${item}`);
      }
    } catch (err) {
      console.error("Error parsing agent message:", err);
    }
  });

  ws.on("close", () => console.log("Voice Agent disconnected"));
  ws.on("error", (err) => console.error("WS Error:", err));
}
