import api from "./axiosClient";
import type { Item } from "../types/Item";

/* =========================
   GET
========================= */

// שליפת כל הפריטים של המשתמש
export const getItems = () => api.get<Item[]>("/items");

/* =========================
   CREATE
========================= */

// יצירת פריט חדש
export const createItem = (data: { name: string; quantity: number }) =>
  api.post<Item>("/items", data);

/* =========================
   UPDATE / ACTIONS
========================= */

// הוספת כמות לפריט
// ⬅️ מחזיר את הפריט המעודכן מהשרת
export const addItem = (id: number, amount = 1) =>
  api.post<Item>(`/items/${id}/add`, { amount });

// הורדת כמות מפריט
// ⬅️ מחזיר את הפריט המעודכן מהשרת
export const removeItem = (id: number, amount = 1) =>
  api.post<Item>(`/items/${id}/remove`, { amount });

/* =========================
   DELETE
========================= */

// מחיקת פריט
// ⬅️ מחזיר את הפריט שנמחק
export const deleteItem = (id: number) =>
  api.delete<Item>(`/items/${id}`);
