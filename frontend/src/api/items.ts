import api from "./axiosClient";

export const getItems = () => api.get("/items");
export const createItem = (data: any) => api.post("/items", data);
export const updateItem = (id: number, data: any) =>
  api.patch(`/items/${id}`, data);
