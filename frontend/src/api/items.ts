import api from "./axiosClient";

export const getItems = () => api.get("/items");

export const createItem = (data: any) => api.post("/items", data);

export const updateItem = (id: number, data: any) =>
  api.patch(`/items/${id}`, data);

// ⭐ הוספת כמות לפריט
export const addItem = (id: number, amount = 1) =>
  api.post(`/items/${id}/add`, { amount });

// ⭐ הורדת כמות מפריט
export const removeItem = (id: number, amount = 1) =>
  api.post(`/items/${id}/remove`, { amount });

export const deleteItem = (id: number) =>
  api.delete(`/items/${id}`);

