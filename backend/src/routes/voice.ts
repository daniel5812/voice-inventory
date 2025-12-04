import { Router } from "express";
import prisma from "../prisma";
import { parseHebrewCommand } from "../services/groqParser";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Missing or invalid text" });
    }

    console.log("📥 Received voice command:", text);

    // שלב 1: ניתוח באמצעות Groq
    const parsed = await parseHebrewCommand(text.trim());
    console.log("✅ Groq parsed:", parsed);

    const { action, quantity, itemName } = parsed;

    // ולידציה
    if (!action || (action !== "add" && action !== "remove")) {
      return res.status(400).json({ 
        error: "Invalid action. Must be 'add' or 'remove'",
        parsed 
      });
    }

    if (!itemName || itemName.trim().length === 0) {
      return res.status(400).json({ 
        error: "Could not identify item name from command",
        parsed 
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        error: "Invalid quantity",
        parsed 
      });
    }

    // שלב 2: מציאת או יצירת פריט
    let item = await prisma.item.findFirst({
      where: { name: itemName.trim() }
    });

    if (!item) {
      console.log("🆕 Creating new item:", itemName);
      item = await prisma.item.create({
        data: { 
          name: itemName.trim(), 
          quantity: 0 
        }
      });
    } else {
      console.log("📦 Found existing item:", item.name, "current quantity:", item.quantity);
    }

    // שלב 3: חישוב כמות חדשה
    const oldQuantity = item.quantity;
    const newQuantity =
      action === "add"
        ? item.quantity + quantity
        : Math.max(0, item.quantity - quantity);

    console.log(`🔄 Updating: ${item.name} ${oldQuantity} -> ${newQuantity} (${action} ${quantity})`);

    // שלב 4: עדכון המלאי
    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: { quantity: newQuantity }
    });

    // שלב 5: שמירת movement (היסטוריה)
    const movement = await prisma.movement.create({
      data: {
        itemId: item.id,
        quantity,
        type: action,
        rawText: text,
      },
    });

    console.log("✅ Movement created:", movement.id);

    res.json({
      success: true,
      item: itemName,
      action,
      quantity,
      oldQuantity,
      newQuantity,
      movementId: movement.id
    });
  } catch (err: any) {
    console.error("❌ Error processing voice command:", err);
    
    // טיפול בשגיאות ספציפיות
    if (err.message?.includes("Groq")) {
      return res.status(503).json({ 
        error: "AI parsing service unavailable",
        details: err.message 
      });
    }
    
    if (err.message?.includes("parse")) {
      return res.status(400).json({ 
        error: "Could not understand the command",
        details: err.message 
      });
    }

    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

export default router;
