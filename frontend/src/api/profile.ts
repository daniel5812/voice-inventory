// src/api/profile.ts
import api from "./axiosClient";

export const getMyProfile = () => {
  return api.get("/me");
};
export const updateMyProfile = (data: { fullName: string }) => {
  return api.patch("/me", data);
};

