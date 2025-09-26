// src/api/reviews.ts
import axiosInstance from "../lib/axiosInstance";
import type { ReviewData } from "../types/review";

// 활동 내역 리뷰 프리뷰
export const getActivityOverview = async () => {
  return await axiosInstance.get("/api/v1/reviews/overview");
};

// 미션 리뷰 프리뷰
export const getMissionReviewsPreview = async (missionId: number) => {
  return await axiosInstance.get(
    `/api/v1/missions/${missionId}/reviews/preview`
  );
};

// 리뷰 작성 후 제출
export const submitReview = async (data: ReviewData) => {
  return await axiosInstance.post("/api/v1/reviews", data);
};

export const loadMore = async (
  apiUrl: string,
  cursorId?: number,
  lastReviewId?: number
) => {
  const params: Record<string, number> = {};

  if (cursorId !== undefined) {
    params.cursorId = cursorId;
  } else if (lastReviewId !== undefined) {
    params.lastReviewId = lastReviewId;
  }

  return await axiosInstance.get(apiUrl, {
    params,
  });
};
