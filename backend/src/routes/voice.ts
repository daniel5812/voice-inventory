import { Router } from "express";
import prisma from "../prisma";
import { parseVoiceCommand } from "../services/openaiCommandParser";

const router = Router();

router.post("/command", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text field" });

    const parsed = await parseVoiceCommand(text);
    if (!parsed) {
      return res.status(400).json({ error: "Could not parse voice command" });
    }

    const { action, quantity, itemName } = parsed;
    console.log("Parsed Command:", parsed);

    let item = await prisma.item.findFirst({
      where: { name: itemName },
    });

    // --- ITEM DOES NOT EXIST: CREATE NEW ---
    if (!item) {
      const initialQty = action === "remove" ? 0 : quantity;

      item = await prisma.item.create({
        data: {
          name: itemName,
          quantity: initialQty,
        },
      });

      // Log Movement for creation
      await prisma.movement.create({
        data: {
          type: "create",
          quantity: initialQty,
          rawText: text,
          itemId: item.id,
        },
      });

      return res.json({
        success: true,
        message: `המוצר "${itemName}" נוצר עם כמות ${initialQty}`,
        item,
      });
    }

    // --- ITEM EXISTS: UPDATE QUANTITY ---
    const prevQty = item.quantity;
    let newQty = prevQty;

    if (action === "add") newQty = prevQty + quantity;
    if (action === "remove") newQty = Math.max(0, prevQty - quantity);
    if (action === "set") newQty = quantity;

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: {
        quantity: newQty,
      },
    });

    // Log Movement
    await prisma.movement.create({
      data: {
        type: action,
        quantity: action === "remove" ? -quantity : quantity,
        rawText: text,
        itemId: item.id,
      },
    });

    return res.json({
      success: true,
      message: `המוצר "${itemName}" עודכן מ-${prevQty} ל-${newQty}`,
      item: updated,
    });
  } catch (error) {
    console.error("Voice command error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;