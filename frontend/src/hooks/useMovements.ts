import { useEffect, useState } from "react";
import type { Movement } from "../types/Movement";
import { getMovements } from "../api/movements";

export const useMovements = (limit = 50) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await getMovements(limit);
    setMovements(res.data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { movements, loading, refresh };
};
