import axiosInstance from "../lib/axiosInstance";

export const getWeather = async () => {
  return await axiosInstance.get("/api/v1/weather");
};

export const getPoint = async () => {
  return await axiosInstance.get("/api/v1/wallet/my-point");
};
