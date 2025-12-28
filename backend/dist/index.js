"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const items_1 = __importDefault(require("./routes/items"));
const movements_1 = __importDefault(require("./routes/movements"));
const voice_1 = __importDefault(require("./routes/voice"));
const voiceAgent_1 = __importDefault(require("./routes/voiceAgent"));
const users_1 = __importDefault(require("./routes/users"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(__dirname, "../.env");
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ROUTES
app.use("/api/items", items_1.default);
app.use("/api/movements", movements_1.default);
app.use("/api/voice", voice_1.default);
app.use("/api/me", users_1.default);
// ROOT TEST
app.get("/", (req, res) => {
    res.send("Voice Inventory API is running");
});
const PORT = process.env.PORT || 5000;
// 🔥 הפעלת מודל הקול של OpenAI כאשר השרת עולה
app.use("/voice-agent", voiceAgent_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
