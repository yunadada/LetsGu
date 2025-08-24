// src/api/missionReview.ts
import axios from "axios";
import axiosInstance from "../lib/axiosInstance";


/** 공통 래퍼 & 유틸 */
type Successish = boolean | "true" | "false";
type ApiWrap<T> = { success: Successish; data: T };
const ok = (s: Successish) => s === true || s === "true";

/** 미션 리뷰 도메인 타입 */
export type SortType = "ASC" | "DESC";

export type Review = {
  reviewId: number;
  memberName: string;
  reviewContent: string;
  reviewImageUrl?: string | null;
  reviewDate: string; // ISO
};

/** 엔드포인트별 페이로드 */
interface PreviewPayload {
  count: number;
  hasNext: boolean;
  nextId?: number;
  missionReviewResponse: Review[];
}

interface ScrollPayload {
  count: number;
  hasNext: boolean;
  nextId?: number;
  missionReviewResponse: Review[];
}

/**
 * 미션 리뷰 프리뷰(최대 3개)
 * 404면 notFound = true
 */
export async function fetchMissionReviewsPreview(
  missionId: number,
  sortType: SortType = "DESC",
  signal?: AbortSignal
): Promise<{
  list: Review[];
  count: number;
  hasNext: boolean;
  nextId?: number;
  notFound: boolean;
}> {
  try {
    const { data } = await axiosInstance.get<ApiWrap<PreviewPayload>>(
      `/api/v1/missions/${missionId}/reviews/preview`,
      {
        headers: { Accept: "application/json" },
        params: { sortType },
        signal,
      }
    );
    if (!ok(data.success)) {
      return { list: [], count: 0, hasNext: false, notFound: true };
    }
    return {
      list: data.data.missionReviewResponse ?? [],
      count: data.data.count ?? 0,
      hasNext: data.data.hasNext ?? false,
      nextId: data.data.nextId,
      notFound: false,
    };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return { list: [], count: 0, hasNext: false, notFound: true };
    }
    throw e;
  }
}

/**
 * 미션 리뷰 무한스크롤
 * nextId를 lastReviewId로 넘겨 다음 페이지 요청
 */
export async function fetchMissionReviewsScroll(params: {
  missionId: number;
  lastReviewId?: number; // 첫 페이지면 undefined
  limit?: number; // 서버 기본 3, 클라 기본 10 등
  sortType?: SortType; // 기본 DESC
  signal?: AbortSignal;
}): Promise<{
  items: Review[];
  count: number;
  hasNext: boolean;
  nextId?: number;
}> {
  const {
    missionId,
    lastReviewId,
    limit = 10,
    sortType = "DESC",
    signal,
  } = params;

  const { data } = await axiosInstance.get<ApiWrap<ScrollPayload>>(
    `/api/v1/missions/${missionId}/reviews/scroll`,
    {
      headers: { Accept: "application/json" },
      params: { lastReviewId, limit, sortType },
      signal,
    }
  );

  if (!ok(data.success)) {
    return { items: [], count: 0, hasNext: false, nextId: undefined };
  }

  return {
    items: data.data.missionReviewResponse ?? [],
    count: data.data.count ?? 0,
    hasNext: data.data.hasNext ?? false,
    nextId: data.data.nextId,
  };
}
