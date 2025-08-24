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
  data: [];
  hasNext: boolean;
  nextCreatedAt: string;
  nextId: number;
};

export type ReviewWriteState = {
  missionId?: number;
  placeName?: string;
};
