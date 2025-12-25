import { Router } from "express";
import prisma from "../prisma";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

router.get("/", requireUser, async (req, res) => {
  const limit = Number(req.query.limit) || 20;

  const movements = await prisma.movement.findMany({
    where: {
      userId: req.user!.id,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      item: true, // 👈 חובה
    },
  });

  res.json(movements);
});

export default router;