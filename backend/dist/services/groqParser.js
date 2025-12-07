"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = groqParser;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
async function groqParser(text) {
    const prompt = `
אתה ממיר פקודות קול לעדכון מלאי.
תחזיר JSON חוקי בלבד (ללא טקסט נוסף).

דוגמאות:
"תוסיף שלוש קולה" → {"action":"add","itemName":"קולה","quantity":3}
"להוריד שני מים" → {"action":"remove","itemName":"מים","quantity":2}

פקודה: "${text}"
  `;
    const response = await groq.chat.completions.create({
        model: "groq/compound-mini", // ← זה המודל שלך!
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });
    const content = response?.choices?.[0]?.message?.content;
    if (!content)
        return null;
    return JSON.parse(content);
}
