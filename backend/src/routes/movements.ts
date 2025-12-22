import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Number(req.query.limit) || 20;

  const movements = await prisma.movement.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      item: true, // 👈 חובה
    },
  });

  res.json(movements);
});

export default router;