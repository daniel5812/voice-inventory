import { useAuth } from "../context/AuthContext";
import { useProfile } from "./useProfile";

export function useCurrentUser() {
  const { user, logout, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  return {
    id: user?.id ?? null,
    email: user?.email ?? null,
    profile,
    displayName: profile?.fullName || user?.email || "Unknown user",
    loading,
    logout,
  };
}
