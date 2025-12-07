"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const limit = Number(req.query.limit) || 20;
    const movements = await prisma_1.default.movement.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            item: true, // 👈 חובה
        },
    });
    res.json(movements);
});
exports.default = router;
