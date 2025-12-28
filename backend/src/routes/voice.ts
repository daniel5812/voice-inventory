// backend/src/routes/voice.ts
import { Router } from "express";
import prisma from "../prisma";
import { parseVoiceCommand } from "../services/openaiCommandParser";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

router.post("/command", requireUser, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing text field" });
    }

    const parsed = await parseVoiceCommand(text);
    if (!parsed) {
      return res.status(400).json({ error: "Could not parse voice command" });
    }

    const { action, quantity, itemName } = parsed;

    if (!itemName || typeof quantity !== "number") {
      return res.status(400).json({ error: "Could not detect item name or quantity" });
    }

    const userId = req.user!.id;

    // case-insensitive match is more realistic for voice
    let item = await prisma.item.findFirst({
      where: {
        userId,
        name: { equals: itemName.trim(), mode: "insensitive" },
      },
    });

    // If item does not exist → create
    if (!item) {
      const initialQty = action === "remove" ? 0 : quantity;

      const result = await prisma.$transaction(async (tx) => {
        const created = await tx.item.create({
          data: {
            name: itemName.trim(),
            quantity: initialQty,
            userId,
          },
        });

        const movement = await tx.movement.create({
          data: {
            itemId: created.id,
            userId,
            type: "create",
            quantity: initialQty,
            rawText: text,
          },
          include: { item: { select: { id: true, name: true } } },
        });

        return { item: created, movement };
      });

      return res.json({
        success: true,
        message: `Created "${result.item.name}" with quantity ${result.item.quantity}`,
        item: result.item,
        movement: result.movement,
      });
    }

    // Item exists → update
    const prevQty = item.quantity;

    let newQty = prevQty;
    if (action === "add") newQty = prevQty + quantity;
    if (action === "remove") newQty = Math.max(0, prevQty - quantity);
    if (action === "set") newQty = quantity;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.item.update({
        where: { id: item!.id },
        data: { quantity: newQty },
      });

      const movementQty = action === "remove" ? -quantity : quantity;

      const movement = await tx.movement.create({
        data: {
          itemId: updated.id,
          userId,
          type: action,
          quantity: movementQty,
          rawText: text,
        },
        include: { item: { select: { id: true, name: true } } },
      });

      return { item: updated, movement };
    });

    return res.json({
      success: true,
      message: `Updated "${result.movement.item?.name ?? itemName}" from ${prevQty} to ${newQty}`,
      item: result.item,
      movement: result.movement,
    });
  } catch (error) {
    console.error("Voice command error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
