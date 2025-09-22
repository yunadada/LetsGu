import axiosInstance from "../lib/axiosInstance";

export const kakaoExchangeToken = async (tempToken: string) => {
  return await axiosInstance.post("/api/v1/auth/token", { code: tempToken });
};
