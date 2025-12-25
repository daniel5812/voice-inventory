import { Router } from "express";
import prisma from "../prisma";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

/*  
=========================================
   GET /items – שליפת פריטים של המשתמש
=========================================
*/
router.get("/", requireUser, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: { id: "asc" },
    });

    res.json(items);
  } catch (e) {
    console.error("GET /items error:", e);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/*  
=========================================
   POST /items – יצירת פריט חדש
=========================================
*/
router.post("/", requireUser, async (req, res) => {
  const { name, quantity } = req.body;

  if (!name || quantity == null) {
    return res.status(400).json({ error: "name and quantity are required" });
  }

  try {
    const item = await prisma.item.create({
      data: {
        name,
        quantity,
        userId: req.user!.id, // ⭐ השיוך הקריטי
      },
    });

    await prisma.movement.create({
      data: {
        itemId: item.id,
        userId: req.user!.id,
        type: "create",
        quantity,
        rawText: "manual create",
      },
    });

    res.json(item);
  } catch (e) {
    console.error("POST /items error:", e);
    res.status(500).json({ error: "Failed to create item" });
  }
});

/*  
=========================================
   POST /items/:id/add – הוספת כמות
=========================================
*/
router.post("/:id/add", requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "invalid amount" });
  }

  try {
    const item = await prisma.item.updateMany({
      where: {
        id,
        userId: req.user!.id, // 🔐 מגן על פריטים של אחרים
      },
      data: {
        quantity: { increment: amount },
      },
    });

    if (item.count === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    await prisma.movement.create({
      data: {
        itemId: id,
        userId: req.user!.id,
        type: "add",
        quantity: amount,
        rawText: `manual add ${amount}`,
      },
    });

    res.json({ success: true });
  } catch (e) {
    console.error("ADD item error:", e);
    res.status(500).json({ error: "Failed to add quantity" });
  }
});

/*  
=========================================
   POST /items/:id/remove – הורדת כמות
=========================================
*/
router.post("/:id/remove", requireUser, async (req, res) => {
  const id = Number(req.params.id);
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "invalid amount" });
  }

  try {
    const item = await prisma.item.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const newQty = Math.max(0, item.quantity - amount);

    const updated = await prisma.item.update({
      where: { id },
      data: { quantity: newQty },
    });

    await prisma.movement.create({
      data: {
        itemId: id,
        userId: req.user!.id,
        type: "remove",
        quantity: -amount,
        rawText: `manual remove ${amount}`,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error("REMOVE item error:", e);
    res.status(500).json({ error: "Failed to remove quantity" });
  }
});

/*  
=========================================
   DELETE /items/:id – מחיקת פריט
=========================================
*/
router.delete("/:id", requireUser, async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.movement.deleteMany({
      where: {
        itemId: id,
        userId: req.user!.id,
      },
    });

    const deleted = await prisma.item.deleteMany({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ success: true });
  } catch (e) {
    console.error("DELETE item error:", e);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
