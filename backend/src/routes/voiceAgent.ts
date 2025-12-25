import { Router } from "express";
import { requireUser } from "../middlewares/requireUser";
import { startVoiceAgent } from "../services/openaiVoiceAgent";

const router = Router();

router.post("/start", requireUser, (req, res) => {
  const userId = req.user!.id;

  startVoiceAgent(userId);

  res.json({
    success: true,
    message: "Voice agent started",
    userId,
  });
});

export default router;
