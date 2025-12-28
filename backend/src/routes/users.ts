import { Router } from "express";
import prisma from "../prisma";
import { requireUser } from "../middlewares/requireUser";

const router = Router();

/*
=========================================
GET /me – פרופיל משתמש מחובר
=========================================
*/
router.get("/", requireUser, async (req, res) => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      // מצב חריג – ה־Trigger לא רץ או DB לא עקבי
      return res.status(404).json({
        error: "User profile not found",
      });
    }

    res.json(profile);
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

/*
=========================================
PATCH /me – עדכון פרופיל משתמש
=========================================
*/
router.patch("/", requireUser, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { fullName } = req.body;

    if (typeof fullName !== "string") {
      return res.status(400).json({
        error: "fullName must be a string",
      });
    }

    const updatedProfile = await prisma.userProfile.update({
      where: { id: userId },
      data: {
        fullName,
      },
    });

    res.json(updatedProfile);
  } catch (err) {
    console.error("PATCH /me error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


export default router;
