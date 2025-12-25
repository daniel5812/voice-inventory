import { Router } from "express";
import prisma from "../prisma";
import { parseVoiceCommand } from "../services/openaiCommandParser";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

router.post("/command", requireUser, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text field" });
    }

    const parsed = await parseVoiceCommand(text);
    if (!parsed) {
      return res.status(400).json({ error: "Could not parse voice command" });
    }

    const { action, quantity, itemName } = parsed;

    if (!itemName || typeof quantity !== "number") {
      return res.status(400).json({ error: "לא הצלחתי לזהות את שם המוצר או הכמות" });
    }

    const userId = req.user!.id;

    console.log("Parsed Command:", parsed, "User:", userId);

    // Ensure UserProfile exists (in case DB was reset but User is still logged in)
    const userExists = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (!userExists) {
      await prisma.userProfile.create({
        data: {
          id: userId,
          email: (req.user as any).email || "recovered@example.com",
          fullName: "Recovered User",
        },
      });
    }

    let item = await prisma.item.findFirst({
      where: {
        name: itemName,
        userId,
      },
    });

    // --- ITEM DOES NOT EXIST: CREATE ---
    if (!item) {
      const initialQty = action === "remove" ? 0 : quantity;

      item = await prisma.item.create({
        data: {
          name: itemName,
          quantity: initialQty,
          userId,
        },
      });

      await prisma.movement.create({
        data: {
          itemId: item.id,
          userId,
          type: "create",
          quantity: initialQty,
          rawText: text,
        },
      });

      return res.json({
        success: true,
        message: `המוצר "${itemName}" נוצר עם כמות ${initialQty}`,
        item,
      });
    }

    // --- ITEM EXISTS: UPDATE ---
    const prevQty = item.quantity;
    let newQty = prevQty;

    if (action === "add") newQty = prevQty + quantity;
    if (action === "remove") newQty = Math.max(0, prevQty - quantity);
    if (action === "set") newQty = quantity;

    const updated = await prisma.item.update({
      where: { id: item.id },
      data: { quantity: newQty },
    });

    await prisma.movement.create({
      data: {
        itemId: item.id,
        userId,
        type: action,
        quantity: action === "remove" ? -quantity : quantity,
        rawText: text,
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
