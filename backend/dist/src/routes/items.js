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
        data: {
            name,
            quantity
        }
    });
    res.json(item);
});
exports.default = router;
