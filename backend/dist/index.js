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
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ROUTES
app.use("/items", items_1.default);
app.use("/movements", movements_1.default);
app.use("/voice", voice_1.default); // ← חייב להיות כאן
app.get("/", (req, res) => {
    res.send("Voice Inventory API is running");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
