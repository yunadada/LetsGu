// src/api/reviews.ts
import { api } from "./client";
import axios from "axios";

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
    const { data } = await api.get<ReviewsResponse>(
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