import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { itemId, quantity, type } = req.body;

    if (!itemId || !quantity || !type) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // חישוב כמות חדשה
    const newQuantity =
      type === "add" ? item.quantity + quantity : item.quantity - quantity;

    // חסימת כמות שלילית
    if (newQuantity < 0) {
      return res.status(400).json({
        error: "אי אפשר להוריד יותר ממה שקיים במלאי",
        item: item.name,
        currentQuantity: item.quantity,
        requestedRemoval: quantity,
      });
    }

    // עדכון מלאי רק אם תקין
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    // הוספת תנועת מלאי
    await prisma.movement.create({
      data: {
        itemId,
        quantity,
        type,
        rawText: `manual update`,
      },
    });

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
