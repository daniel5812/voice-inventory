import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET /movements
router.get("/", async (req, res) => {
  const limit = Number(req.query.limit) || 50;

  const movements = await prisma.movement.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { item: true },
  });

  res.json(movements);
});

// POST /movements
// body: { itemName: string, quantity: number, type: "ADD" | "REMOVE", rawText?: string }
router.post("/", async (req, res) => {
  try {
    console.log("📥 /movements body:", req.body);

    let { itemName, quantity, type, rawText } = req.body;

    if (!itemName || quantity == null || !type) {
      return res.status(400).json({ error: "itemName, quantity, type are required" });
    }

    // להבטיח שמספר הוא באמת מספר
    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number" });
    }

    const normalizedType = String(type).toLowerCase(); // "add" | "remove"
    if (normalizedType !== "add" && normalizedType !== "remove") {
      return res.status(400).json({ error: "type must be 'add' or 'remove'" });
    }

    itemName = String(itemName).trim();

    // 1️⃣ למצוא פריט לפי שם
    let item = await prisma.item.findFirst({
      where: { name: itemName },
    });

    // 2️⃣ אם לא קיים – ליצור חדש
    if (!item) {
      console.log("🆕 creating new item:", itemName);
      item = await prisma.item.create({
        data: {
          name: itemName,
          quantity: 0,
        },
      });
    }

    // 3️⃣ לחשב מלאי חדש
    const newQuantity =
      normalizedType === "add"
        ? item.quantity + quantity
        : item.quantity - quantity;

    console.log(
      `🔄 updating stock for ${item.name}: ${item.quantity} -> ${newQuantity}`
    );

    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: { quantity: newQuantity },
    });

    // 4️⃣ ליצור Movement
    const movement = await prisma.movement.create({
      data: {
        itemId: item.id,
        quantity,
        type: normalizedType,
        rawText: rawText ?? "",
      },
    });

    return res.status(201).json({
      message: "Movement created and stock updated",
      item: updatedItem,
      movement,
    });
  } catch (err) {
    console.error("❌ Error in POST /movements:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
