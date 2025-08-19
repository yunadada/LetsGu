// src/api/auth.ts
import { api } from "../api/client";

export interface SignupReq {
  email: string;
  nickname: string;
  password: string;
  profileImageUrl?: string;
}

// 서버 응답 스키마에 맞게 필요 필드만 적어둔 예시 (모르면 unknown으로 받아도 OK)
export interface SignupRes {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  // accessToken?: string; refreshToken?: string;  // 서버가 주면 추가
}

export const signup = async (payload: SignupReq): Promise<SignupRes> => {
  const { data } = await api.post("/api/v1/auth/signup", payload);
  return data;
};