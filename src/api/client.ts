// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 쿠키 기반이면 true
});

// 요청 인터셉터: 매 요청에 토큰 붙이기
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// // 응답 인터셉터: 에러 처리
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       alert("로그인이 필요합니다.");
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// 사용예시
// import { api } from "./api/client";

// // GET
// async function getUserInfo() {
//   const res = await api.get("/user/me");
//   console.log(res.data); // 토큰 자동 첨부됨
// }

// // POST
// async function createPost() {
//   const res = await api.post("/posts", {
//     title: "제목",
//     content: "내용",
//   });
//   console.log(res.data);
// }