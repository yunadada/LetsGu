// src/api/reviews.ts
import axiosInstance from "../lib/axiosInstance";
import axios from "axios";
import type { ReviewData } from "../types/review";

export type Review = {
  reviewId: number;
  memberName: string;
  reviewContent: string;
  reviewImageUrl?: string | null;
  reviewDate: string; // ISO
};

type ReviewsResponse = {
  success: boolean | "true" | "false";
  data: Review[];
};

export const fetchMissionReviews = async (
  missionId: number
): Promise<{ list: Review[]; notFound: boolean }> => {
  try {
    const { data } = await axiosInstance.get<ReviewsResponse>(
      `/api/v1/missions/${missionId}/reviews/preview`
    );
    return { list: data?.data ?? [], notFound: false };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      // 404 → “작성된 리뷰가 없습니다.”
      return { list: [], notFound: true };
    }
    throw e; // 다른 에러는 상위에서 처리
  }
};

export const getActivityOverview = async () => {
  return await axiosInstance.get("/api/v1/reviews/overview");
};

export const submitReview = async ({ data }: ReviewData) => {
  return await axiosInstance.post("/api/v1/reviews", data);
};

export const loadMore = async (apiUrl: string, cursorId: number) => {
  return await axiosInstance.get(apiUrl, {
    params: {
      cursorId,
    },
  });
};
