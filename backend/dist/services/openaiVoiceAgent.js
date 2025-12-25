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
/**
 * מפעיל Voice Agent עבור משתמש מסוים
 */
function startVoiceAgent(userId) {
    const ws = new ws_1.default("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview", {
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
        },
    });
    ws.on("open", () => {
        console.log("🔊 Voice Agent connected for user:", userId);
    });
    ws.on("message", async (msg) => {
        try {
            const data = JSON.parse(msg.toString());
            if (data.type === "response.output_text.delta") {
                console.log("🗣️ MODEL SAID:", data.delta);
            }
            if (data.type === "response.reflection.delta") {
                const reflection = data.delta;
                const action = reflection.action;
                const itemName = reflection.itemName;
                const quantity = reflection.quantity;
                const originalText = reflection.originalText;
                if (!action || !itemName || !quantity)
                    return;
                // חיפוש פריט של המשתמש בלבד
                let item = await prisma_1.default.item.findFirst({
                    where: {
                        name: itemName,
                        userId,
                    },
                });
                if (!item) {
                    item = await prisma_1.default.item.create({
                        data: {
                            name: itemName,
                            quantity: 0,
                            userId,
                        },
                    });
                    await prisma_1.default.movement.create({
                        data: {
                            itemId: item.id,
                            userId,
                            type: "create",
                            quantity: 0,
                            rawText: originalText,
                        },
                    });
                }
                let newQuantity = action === "add"
                    ? item.quantity + quantity
                    : Math.max(0, item.quantity - quantity);
                const updated = await prisma_1.default.item.update({
                    where: { id: item.id },
                    data: { quantity: newQuantity },
                });
                await prisma_1.default.movement.create({
                    data: {
                        itemId: item.id,
                        userId,
                        type: action,
                        quantity: action === "remove" ? -quantity : quantity,
                        rawText: originalText,
                    },
                });
                console.log(`📦 [${userId}] Inventory updated: ${action} ${quantity} ${itemName}`);
            }
        }
        catch (err) {
            console.error("Error parsing agent message:", err);
        }
    });
    ws.on("close", () => console.log("Voice Agent disconnected"));
    ws.on("error", (err) => console.error("WS Error:", err));
}
