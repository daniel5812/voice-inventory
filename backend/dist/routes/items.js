"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
/*
=========================================
   GET /items  – שליפת כל הפריטים
=========================================
*/
router.get("/", async (req, res) => {
    try {
        const items = await prisma_1.default.item.findMany({
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
   POST /items  – יצירת פריט חדש
=========================================
*/
router.post("/", async (req, res) => {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
        return res.status(400).json({ error: "name and quantity are required" });
    }
    try {
        const item = await prisma_1.default.item.create({
            data: { name, quantity },
        });
        // יצירת תנועה מסוג CREATE
        await prisma_1.default.movement.create({
            data: {
                itemId: item.id,
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
   POST /items/:id/add  – הוספת כמות
=========================================
*/
router.post("/:id/add", async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const item = await prisma_1.default.item.update({
            where: { id },
            data: { quantity: { increment: amount } },
        });
        await prisma_1.default.movement.create({
            data: {
                itemId: id,
                type: "add",
                quantity: amount,
                rawText: `manual add ${amount}`,
            },
        });
        res.json(item);
    }
    catch (e) {
        console.error("ADD item error:", e);
        res.status(500).json({ error: "Failed to add quantity" });
    }
});
/*
=========================================
   POST /items/:id/remove  – הורדת כמות
=========================================
*/
router.post("/:id/remove", async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const item = await prisma_1.default.item.findUnique({ where: { id } });
        if (!item)
            return res.status(404).json({ error: "Item not found" });
        const newQty = Math.max(0, item.quantity - amount);
        const updated = await prisma_1.default.item.update({
            where: { id },
            data: { quantity: newQty },
        });
        await prisma_1.default.movement.create({
            data: {
                itemId: id,
                type: "remove",
                quantity: -amount, // נשמור כמות שלילית בלוג
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
   DELETE /items/:id  – מחיקת פריט מלא
=========================================
*/
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        // מחיקה של כל התנועות של הפריט
        await prisma_1.default.movement.deleteMany({
            where: { itemId: id },
        });
        // מחיקה של המוצר עצמו
        await prisma_1.default.item.delete({
            where: { id },
        });
        res.json({ success: true });
    }
    catch (e) {
        console.error("DELETE item error:", e);
        res.status(500).json({ error: "Failed to delete item" });
    }
});
exports.default = router;
