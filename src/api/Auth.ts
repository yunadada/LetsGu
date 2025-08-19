import axiosInstance from "../lib/axiosInstance";
import type { UserInfo } from "../types/userInfo";

export const requestLogin = async (userInfo: UserInfo) => {
  return await axiosInstance.post("/api/v1/auth/login", userInfo);
};
