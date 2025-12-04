import { useEffect, useState } from "react";
import type { Item } from "../types/Item";
import { getItems } from "../api/items";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await getItems();
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { items, loading, refresh };
};
