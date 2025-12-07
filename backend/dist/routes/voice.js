"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const groqParser_1 = __importDefault(require("../services/groqParser"));
const router = (0, express_1.Router)();
router.post("/command", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Missing text field" });
        }
        // פירוש הפקודה באמצעות גרוק
        const parsed = await (0, groqParser_1.default)(text);
        if (!parsed) {
            return res.status(400).json({ error: "Could not parse voice command" });
        }
        const { action, quantity, itemName } = parsed;
        // איתור/יצירת פריט
        let item = await prisma_1.default.item.findFirst({
            where: { name: itemName },
        });
        if (!item) {
            item = await prisma_1.default.item.create({
                data: { name: itemName, quantity: 0 },
            });
        }
        // חישוב כמות חדשה
        let newQuantity = action === "add" ? item.quantity + quantity : item.quantity - quantity;
        // מניעת כל מצב שבו newQuantity קטן מ־0
        if (newQuantity < 0) {
            return res.status(400).json({
                error: "לא ניתן להוריד יותר מהמלאי הקיים",
                item: item.name,
                currentQuantity: item.quantity,
                attemptedRemoval: quantity
            });
        }
        // עדכון פריט — רק אם newQuantity תקין
        await prisma_1.default.item.update({
            where: { id: item.id },
            data: { quantity: newQuantity },
        });
        // יצירת תנועה במלאי
        await prisma_1.default.movement.create({
            data: {
                itemId: item.id,
                quantity,
                type: action,
                rawText: text,
            },
        });
        res.json({ success: true, parsed, newQuantity });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});
exports.default = router;
