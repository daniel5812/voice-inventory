import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getItems } from "../api/items";
import { getMovements } from "../api/movements";
import { useRealtime } from "../hooks/useRealtime";
import type { Item } from "../types/Item";
import type { Movement } from "../types/Movement";

interface InventoryContextValue {
  items: Item[];
  movements: Movement[];
  loading: boolean;
  refreshAll: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    console.log("REFRESH ALL", Date.now());
    const [itemsRes, movementsRes] = await Promise.all([
      getItems(),
      getMovements(30),
    ]);
    setItems(itemsRes.data);
    setMovements(movementsRes.data);
    setLoading(false);
  }, []);

  // טעינה ראשונית – פעם אחת בלבד
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Realtime – פעם אחת בלבד
  useRealtime(refreshAll);

  return (
    <InventoryContext.Provider
      value={{ items, movements, loading, refreshAll }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}
