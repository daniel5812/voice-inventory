import { Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (req, res) => {
  const items = await prisma.item.findMany();
  res.json(items);
});

router.post("/", async (req, res) => {
  const { name, quantity } = req.body;

  if (!name || quantity == null) {
    return res.status(400).json({ error: "name and quantity are required" });
  }

  const item = await prisma.item.create({
    data: {
      name,
      quantity
    }
  });

  res.json(item);
});

export default router;
