"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/items.ts
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const requireUser_1 = require("../middlewares/requireUser");
const router = (0, express_1.Router)();
/*
=========================================
GET /items – user items
=========================================
*/
router.get("/", requireUser_1.requireUser, async (req, res) => {
    try {
        const items = await prisma_1.default.item.findMany({
            where: { userId: req.user.id },
            orderBy: { id: "asc" },
        });
        res.setHeader("Cache-Control", "no-store");
        res.json(items);
    }
    catch (e) {
        console.error("GET /items error:", e);
        res.status(500).json({ error: "Failed to fetch items" });
    }
});
/*
Helper: create movement and include item {id,name}
*/
async function createMovementWithItem(params) {
    return prisma_1.default.movement.create({
        data: {
            userId: params.userId,
            itemId: params.itemId,
            type: params.type,
            quantity: params.quantity,
            rawText: params.rawText,
        },
        include: {
            item: { select: { id: true, name: true } },
        },
    });
}
/*
=========================================
POST /items – create item
Returns: { success, message, item, movement }
=========================================
*/
router.post("/", requireUser_1.requireUser, async (req, res) => {
    const { name, quantity } = req.body;
    if (!name || typeof name !== "string" || quantity == null) {
        return res.status(400).json({ error: "name and quantity are required" });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
        return res.status(400).json({ error: "quantity must be a non-negative number" });
    }
    try {
        const userId = req.user.id;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const item = await tx.item.create({
                data: { name: name.trim(), quantity: qty, userId },
            });
            const movement = await tx.movement.create({
                data: {
                    itemId: item.id,
                    userId,
                    type: "create",
                    quantity: qty,
                    rawText: "manual create",
                },
                include: { item: { select: { id: true, name: true } } },
            });
            return { item, movement };
        });
        return res.json({
            success: true,
            message: `Created "${result.item.name}" with quantity ${result.item.quantity}`,
            item: result.item,
            movement: result.movement,
        });
    }
    catch (e) {
        console.error("POST /items error:", e);
        res.status(500).json({ error: "Failed to create item" });
    }
});
/*
=========================================
POST /items/:id/add – add quantity
Returns: { success, message, item, movement }
=========================================
*/
router.post("/:id/add", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const userId = req.user.id;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const updated = await tx.item.update({
                where: { id, userId },
                data: { quantity: { increment: amt } },
            });
            const movement = await tx.movement.create({
                data: {
                    itemId: id,
                    userId,
                    type: "add",
                    quantity: amt,
                    rawText: `manual add ${amt}`,
                },
                include: { item: { select: { id: true, name: true } } },
            });
            return { item: updated, movement };
        });
        return res.json({
            success: true,
            message: `Added ${amt} to "${result.movement.item?.name ?? "item"}"`,
            item: result.item,
            movement: result.movement,
        });
    }
    catch (e) {
        console.error("ADD item error:", e);
        res.status(500).json({ error: "Failed to add quantity" });
    }
});
/*
=========================================
POST /items/:id/remove – remove quantity
Returns: { success, message, item, movement }
=========================================
*/
router.post("/:id/remove", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    const { amount } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({ error: "invalid amount" });
    }
    try {
        const userId = req.user.id;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const item = await tx.item.findFirst({
                where: { id, userId },
            });
            if (!item) {
                // throw to be caught below
                throw new Error("ITEM_NOT_FOUND");
            }
            const newQty = Math.max(0, item.quantity - amt);
            const updated = await tx.item.update({
                where: { id, userId },
                data: { quantity: newQty },
            });
            const movement = await tx.movement.create({
                data: {
                    itemId: id,
                    userId,
                    type: "remove",
                    quantity: -amt,
                    rawText: `manual remove ${amt}`,
                },
                include: { item: { select: { id: true, name: true } } },
            });
            return { item: updated, movement };
        });
        return res.json({
            success: true,
            message: `Removed ${amt} from "${result.movement.item?.name ?? "item"}"`,
            item: result.item,
            movement: result.movement,
        });
    }
    catch (e) {
        if (e?.message === "ITEM_NOT_FOUND") {
            return res.status(404).json({ error: "Item not found" });
        }
        console.error("REMOVE item error:", e);
        res.status(500).json({ error: "Failed to remove quantity" });
    }
});
/*
=========================================
DELETE /items/:id – delete item
(keeps current behavior of deleting movements first)
Returns: { success, message, item }
=========================================
*/
router.delete("/:id", requireUser_1.requireUser, async (req, res) => {
    const id = Number(req.params.id);
    try {
        const userId = req.user.id;
        const item = await prisma_1.default.item.findFirst({
            where: { id, userId },
        });
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        await prisma_1.default.$transaction(async (tx) => {
            // delete movements first to avoid FK issues
            await tx.movement.deleteMany({ where: { itemId: id } });
            await tx.item.delete({ where: { id } });
        });
        return res.json({
            success: true,
            message: `Deleted "${item.name}"`,
            item,
        });
    }
    catch (e) {
        console.error("DELETE item error:", e);
        res.status(500).json({ error: "Failed to delete item" });
    }
});
exports.default = router;
