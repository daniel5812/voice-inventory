"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const requireUser_1 = require("../middlewares/requireUser");
const router = (0, express_1.Router)();
/*
=========================================
   GET /items – שליפת פריטים של המשתמש
=========================================
*/
router.get("/", requireUser_1.requireUser, async (req, res) => {
    try {
        const items = await prisma_1.default.item.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: { id: "asc" },
        });
        res.json(items);
    }
    catch (e) {
        console.error("GET /items error:", e);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});
/*
=========================================
   POST /items – יצירת פריט חדש
=========================================
*/
router.post("/", requireUser_1.requireUser, async (req, res) => {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
        return res.status(400).json({ error: "name and quantity are required" });
    }
    try {
        const item = await prisma_1.default.item.create({
            data: {
                name,
                quantity,
                userId: req.user.id, // ⭐ השיוך הקריטי
            },
        });
        await prisma_1.default.movement.create({
            data: {
                itemId: item.id,
                userId: req.user.id,
                type: "create",
                quantity,
                rawText: "manual create",
            },
        });
        res.json(item);
    }
    catch (e) {
        console.error("POST /items error:", e);
        res.status(500).json({ error: "Failed to create item" });
    }
});
/*
=========================================
   POST /items/:id/add – הוספת כמות
=========================================
*/
router.post("/:id/add", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const item = await prisma_1.default.item.updateMany({
            where: {
                id,
                userId: req.user.id, // 🔐 מגן על פריטים של אחרים
            },
            data: {
                quantity: { increment: amount },
            },
        });
        if (item.count === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        await prisma_1.default.movement.create({
            data: {
                itemId: id,
                userId: req.user.id,
                type: "add",
                quantity: amount,
                rawText: `manual add ${amount}`,
            },
        });
        res.json({ success: true });
    }
    catch (e) {
        console.error("ADD item error:", e);
        res.status(500).json({ error: "Failed to add quantity" });
    }
});
/*
=========================================
   POST /items/:id/remove – הורדת כמות
=========================================
*/
router.post("/:id/remove", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const item = await prisma_1.default.item.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        const newQty = Math.max(0, item.quantity - amount);
        const updated = await prisma_1.default.item.update({
            where: { id },
            data: { quantity: newQty },
        });
        await prisma_1.default.movement.create({
            data: {
                itemId: id,
                userId: req.user.id,
                type: "remove",
                quantity: -amount,
                rawText: `manual remove ${amount}`,
            },
        });
        res.json(updated);
    }
    catch (e) {
        console.error("REMOVE item error:", e);
        res.status(500).json({ error: "Failed to remove quantity" });
    }
});
/*
=========================================
   DELETE /items/:id – מחיקת פריט
=========================================
*/
router.delete("/:id", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma_1.default.movement.deleteMany({
            where: {
                itemId: id,
                userId: req.user.id,
            },
        });
        const deleted = await prisma_1.default.item.deleteMany({
            where: {
                id,
                userId: req.user.id,
            },
        });
        if (deleted.count === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json({ success: true });
    }
    catch (e) {
        console.error("DELETE item error:", e);
        res.status(500).json({ error: "Failed to delete item" });
    }
});
exports.default = router;
