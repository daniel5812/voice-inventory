"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVoiceAgent = startVoiceAgent;
const ws_1 = __importDefault(require("ws"));
const openai_1 = require("openai");
const prisma_1 = __importDefault(require("../prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
// פונקציה שמתחברת למודל בזמן אמת
function startVoiceAgent() {
    const ws = new ws_1.default("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
        headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
        }
    });
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
                if (!action || !item || !quantity)
                    return;
                // עדכון מלאי
                let dbItem = await prisma_1.default.item.findFirst({ where: { name: item } });
                if (!dbItem) {
                    dbItem = await prisma_1.default.item.create({
                        data: { name: item, quantity: 0 },
                    });
                }
                let newQuantity = action === "add"
                    ? dbItem.quantity + quantity
                    : dbItem.quantity - quantity;
                if (newQuantity < 0)
                    newQuantity = 0;
                await prisma_1.default.item.update({
                    where: { id: dbItem.id },
                    data: { quantity: newQuantity },
                });
                await prisma_1.default.movement.create({
                    data: {
                        itemId: dbItem.id,
                        quantity,
                        type: action,
                        rawText: reflection.originalText,
                    },
                });
                console.log(`Inventory updated: ${action} ${quantity} ${item}`);
            }
        }
        catch (err) {
            console.error("Error parsing agent message:", err);
        }
    });
    ws.on("close", () => console.log("Voice Agent disconnected"));
    ws.on("error", (err) => console.error("WS Error:", err));
}
