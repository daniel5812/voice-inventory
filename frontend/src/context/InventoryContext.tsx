import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import type { Item } from "../types/Item";
import type { Movement } from "../types/Movement";

import {
  getItems,
  createItem,
  addItem,
  removeItem,
  deleteItem,
} from "../api/items";
import { getMovements } from "../api/movements";

/* =========================
   Types
========================= */

interface InventoryContextValue {
  items: Item[];
  movements: Movement[];
  loading: boolean;

  refreshAll: () => Promise<void>;

  create: (name: string, quantity: number) => Promise<void>;
  add: (id: number, amount?: number) => Promise<void>;
  remove: (id: number, amount?: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

/* =========================
   Provider
========================= */

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Initial / Fallback ---------- */

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const [itemsRes, movementsRes] = await Promise.all([
      getItems(),
      getMovements(30),
    ]);
    setItems(itemsRes.data);
    setMovements(movementsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /* ---------- Actions ---------- */

  const create = async (name: string, quantity: number) => {
    const res = await createItem({ name, quantity });
    setItems((prev) => [...prev, res.data]);
    await refreshAll(); // כדי להביא movement חדש
  };

  const add = async (id: number, amount = 1) => {
    const res = await addItem(id, amount);
    setItems((prev) =>
      prev.map((i) => (i.id === res.data.id ? res.data : i))
    );
    await refreshAll();
  };

  const remove = async (id: number, amount = 1) => {
    const res = await removeItem(id, amount);
    setItems((prev) =>
      prev.map((i) => (i.id === res.data.id ? res.data : i))
    );
    await refreshAll();
  };

  const removeItemById = async (id: number) => {
    await deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await refreshAll();
  };

  /* ---------- Context value ---------- */

  return (
    <InventoryContext.Provider
      value={{
        items,
        movements,
        loading,
        refreshAll,

        create,
        add,
        remove,
        removeItem: removeItemById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

/* =========================
   Hook
========================= */

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used inside InventoryProvider");
  }
  return ctx;
}
