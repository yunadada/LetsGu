export type ReviewCount = {
  unWrittenReviewCount: number;
  writtenReviewCount: number;
};

export type UnwrittenLogType = {
  completedMissionId: number;
  placeName: string;
  address: string;
  imageUrl: string;
};

export type WrittenLogType = {
  reviewId: number;
  content: string;
  imageUrl: string;
  placeName: string;
  address: string;
  createdAt: string;
};

export type ReviewData = {
  completedMissionId: number;
  content: string;
};

export type PageResponse = {
  data?: [];
  hasNext: boolean;
  nextCreatedAt: string | null;
  nextId: number | null;
};

export type ReviewWriteState = {
  missionId?: number;
  placeName?: string;
};

// 지도 리뷰
export type MissionReview = {
  reviewId: number;
  memberName: string;
  reviewContent: string;
  reviewImageUrl: string;
  reviewDate: string;
  profileImageUrl: string;
};
