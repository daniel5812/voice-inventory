"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/movements.ts
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const requireUser_1 = require("../middlewares/requireUser");
const router = (0, express_1.Router)();
/*
=========================================
GET /movements?limit=30 – user movements
(always includes item {id, name})
=========================================
*/
router.get("/", requireUser_1.requireUser, async (req, res) => {
    try {
        const limitRaw = req.query.limit;
        const limit = typeof limitRaw === "string" ? Math.min(Number(limitRaw) || 50, 200) : 50;
        const movements = await prisma_1.default.movement.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                item: {
                    select: { id: true, name: true },
                },
            },
        });
        // Prevent 304 caching weirdness while debugging
        res.setHeader("Cache-Control", "no-store");
        res.json(movements);
    }
    catch (e) {
        console.error("GET /movements error:", e);
        res.status(500).json({ error: "Failed to fetch movements" });
    }
});
exports.default = router;
