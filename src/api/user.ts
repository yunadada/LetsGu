import axiosInstance from "../lib/axiosInstance";

export const getMypageData = async () => {
  return await axiosInstance.get("/api/v1/members/my-profile");
};
