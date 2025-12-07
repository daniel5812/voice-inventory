"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const items = await prisma_1.default.item.findMany();
    res.json(items);
});
router.post("/", async (req, res) => {
    const { name, quantity } = req.body;
    if (!name || quantity == null) {
        return res.status(400).json({ error: "name and quantity are required" });
    }
    const item = await prisma_1.default.item.create({
        data: { name, quantity }
    });
    res.json(item);
});
// ----------------------------------------------------
// ADD quantity manually
// ----------------------------------------------------
router.post("/:id/add", async (req, res) => {
    const id = Number(req.params.id);
    const amount = Number(req.body.amount ?? 1);
    const item = await prisma_1.default.item.findUnique({ where: { id } });
    if (!item)
        return res.status(404).json({ error: "Item not found" });
    const updated = await prisma_1.default.item.update({
        where: { id },
        data: { quantity: item.quantity + amount },
    });
    await prisma_1.default.movement.create({
        data: {
            type: "add",
            quantity: amount,
            rawText: `manual add ${amount}`,
            itemId: id,
        },
    });
    res.json(updated);
});
// ----------------------------------------------------
// REMOVE quantity manually
// ----------------------------------------------------
router.post("/:id/remove", async (req, res) => {
    const id = Number(req.params.id);
    const amount = Number(req.body.amount ?? 1);
    const item = await prisma_1.default.item.findUnique({ where: { id } });
    if (!item)
        return res.status(404).json({ error: "Item not found" });
    const updated = await prisma_1.default.item.update({
        where: { id },
        data: { quantity: Math.max(0, item.quantity - amount) },
    });
    await prisma_1.default.movement.create({
        data: {
            type: "remove",
            quantity: -amount,
            rawText: `manual remove ${amount}`,
            itemId: id,
        },
    });
    res.json(updated);
});
exports.default = router;
