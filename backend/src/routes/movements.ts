// backend/src/routes/movements.ts
import { Router } from "express";
import prisma from "../prisma";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

/*
=========================================
GET /movements?limit=30 – user movements
(always includes item {id, name})
=========================================
*/
router.get("/", requireUser, async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    const limit =
      typeof limitRaw === "string" ? Math.min(Number(limitRaw) || 50, 200) : 50;

    const movements = await prisma.movement.findMany({
      where: { userId: req.user!.id },
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
  } catch (e) {
    console.error("GET /movements error:", e);
    res.status(500).json({ error: "Failed to fetch movements" });
  }
});

export default router;
