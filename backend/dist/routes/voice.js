"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const openaiCommandParser_1 = require("../services/openaiCommandParser");
const requireUser_1 = require("../middlewares/requireUser");
const router = (0, express_1.Router)();
router.post("/command", requireUser_1.requireUser, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Missing text field" });
        }
        const parsed = await (0, openaiCommandParser_1.parseVoiceCommand)(text);
        if (!parsed) {
            return res.status(400).json({ error: "Could not parse voice command" });
        }
        const { action, quantity, itemName } = parsed;
        if (!itemName || typeof quantity !== "number") {
            return res.status(400).json({ error: "לא הצלחתי לזהות את שם המוצר או הכמות" });
        }
        const userId = req.user.id;
        console.log("Parsed Command:", parsed, "User:", userId);
        // Ensure UserProfile exists (in case DB was reset but User is still logged in)
        const userExists = await prisma_1.default.userProfile.findUnique({ where: { id: userId } });
        if (!userExists) {
            await prisma_1.default.userProfile.create({
                data: {
                    id: userId,
                    email: req.user.email || "recovered@example.com",
                    fullName: "Recovered User",
                },
            });
        }
        let item = await prisma_1.default.item.findFirst({
            where: {
                name: itemName,
                userId,
            },
        });
        // --- ITEM DOES NOT EXIST: CREATE ---
        if (!item) {
            const initialQty = action === "remove" ? 0 : quantity;
            item = await prisma_1.default.item.create({
                data: {
                    name: itemName,
                    quantity: initialQty,
                    userId,
                },
            });
            await prisma_1.default.movement.create({
                data: {
                    itemId: item.id,
                    userId,
                    type: "create",
                    quantity: initialQty,
                    rawText: text,
                },
            });
            return res.json({
                success: true,
                message: `המוצר "${itemName}" נוצר עם כמות ${initialQty}`,
                item,
            });
        }
        // --- ITEM EXISTS: UPDATE ---
        const prevQty = item.quantity;
        let newQty = prevQty;
        if (action === "add")
            newQty = prevQty + quantity;
        if (action === "remove")
            newQty = Math.max(0, prevQty - quantity);
        if (action === "set")
            newQty = quantity;
        const updated = await prisma_1.default.item.update({
            where: { id: item.id },
            data: { quantity: newQty },
        });
        await prisma_1.default.movement.create({
            data: {
                itemId: item.id,
                userId,
                type: action,
                quantity: action === "remove" ? -quantity : quantity,
                rawText: text,
            },
        });
        return res.json({
            success: true,
            message: `המוצר "${itemName}" עודכן מ-${prevQty} ל-${newQty}`,
            item: updated,
        });
    }
    catch (error) {
        console.error("Voice command error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
