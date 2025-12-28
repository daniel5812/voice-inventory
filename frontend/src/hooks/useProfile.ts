// src/hooks/useProfile.ts
import { useEffect, useState, useCallback } from "react";
import { getMyProfile, updateMyProfile } from "../api/profile";
import type { UserProfile } from "../types/UserProfile";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 טעינה ראשונית
  const loadProfile = useCallback(() => {
    setLoading(true);
    setError(null);

    getMyProfile()
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        setError("Failed to load profile");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 🔹 PATCH /me – עדכון שם מלא
  const updateProfile = async (fullName: string) => {
    try {
      const res = await updateMyProfile({ fullName });
      setProfile(res.data); // ✅ רינדור מיידי
    } catch (err) {
      console.error(err);
      throw new Error("Failed to update profile");
    }
  };

  return {
    profile,
    loading,
    error,
    reload: loadProfile,     // אופציונלי – שימושי
    updateProfile,           // ⭐ חדש
  };
}
