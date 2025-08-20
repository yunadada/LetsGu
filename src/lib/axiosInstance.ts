import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else if (config.headers) {
        (config.headers as RawAxiosRequestHeaders)[
          "Authorization"
        ] = `Bearer ${token}`;
      } else {
        config.headers = new AxiosHeaders({
          Authorization: `Bearer ${token}`,
        });
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
