// src/context/InventoryContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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

type MutateResponse = {
  success?: boolean;
  message?: string;
  item?: Item;
  movement?: Movement;
};

interface InventoryContextValue {
  items: Item[];
  movements: Movement[];
  loading: boolean;

  refreshAll: () => Promise<void>;

  create: (name: string, quantity: number) => Promise<void>;
  add: (id: number, amount?: number) => Promise<void>;
  remove: (id: number, amount?: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;

  // Optional: allow other features (like voice UI) to apply server mutations
  applyMutation: (payload: { item?: Item; movement?: Movement }) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, movementsRes] = await Promise.all([
        getItems(),
        getMovements(30),
      ]);

      setItems(itemsRes.data ?? []);
      setMovements(movementsRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const applyMutation = useCallback(
    (payload: { item?: Item; movement?: Movement }) => {
      const { item, movement } = payload;

      if (item) {
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.id === item.id);
          if (idx === -1) return [...prev, item];
          const next = [...prev];
          next[idx] = item;
          return next;
        });
      }

      if (movement) {
        // Ensure movement.item exists to prevent Dashboard/ActionHistory crashes
        const safeMovement: Movement = movement.item
          ? movement
          : {
              ...movement,
              item:
                item
                  ? { id: item.id, name: item.name }
                  : (movement as any).item ?? undefined,
            };

        setMovements((prev) => [safeMovement, ...prev].slice(0, 30));
      }
    },
    []
  );

  const create = useCallback(
    async (name: string, quantity: number) => {
      const res = await createItem({ name, quantity });
      const data = res.data as MutateResponse;

      if (data?.item || data?.movement) {
        applyMutation({ item: data.item, movement: data.movement });
        return;
      }

      // fallback for older backend behavior
      setItems((prev) => [...prev, res.data as Item]);
      await refreshAll();
    },
    [applyMutation, refreshAll]
  );

  const add = useCallback(
    async (id: number, amount = 1) => {
      const res = await addItem(id, amount);
      const data = res.data as MutateResponse;

      if (data?.item || data?.movement) {
        applyMutation({ item: data.item, movement: data.movement });
        return;
      }

      const updatedItem = res.data as Item;
      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      await refreshAll();
    },
    [applyMutation, refreshAll]
  );

  const remove = useCallback(
    async (id: number, amount = 1) => {
      const res = await removeItem(id, amount);
      const data = res.data as MutateResponse;

      if (data?.item || data?.movement) {
        applyMutation({ item: data.item, movement: data.movement });
        return;
      }

      const updatedItem = res.data as Item;
      setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
      await refreshAll();
    },
    [applyMutation, refreshAll]
  );

  const removeItemById = useCallback(async (id: number) => {
    await deleteItem(id);

    setItems((prev) => prev.filter((i) => i.id !== id));
    // If you keep deleting movements in backend, the UI shouldn't depend on delete movement.
    // If you later keep delete history, you can also update movements here.
  }, []);

  const value = useMemo(
    () => ({
      items,
      movements,
      loading,
      refreshAll,
      create,
      add,
      remove,
      removeItem: removeItemById,
      applyMutation,
    }),
    [items, movements, loading, refreshAll, create, add, remove, removeItemById, applyMutation]
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used inside InventoryProvider");
  return ctx;
}
