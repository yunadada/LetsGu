// src/api/mission.ts
import axiosInstance from "../lib/axiosInstance";

/** 서버가 내려주는 미션 타입 */
export type Mission = {
  address: string;
  missionId: number;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  // 서버 키 그대로 둠 (UI 아이콘 키와 매핑은 화면단에서 처리)
  placeCategory:
    | "CULTURE_HISTORY"
    | "NATURE_PARK"
    | "FOOD_CAFE"
    | "ART_EXHIBITION_EXPERIENCE"
    | "LIFE_CONVENIENCE"
    | string;
  isCompleted: boolean;
};

type MissionsResponse = {
  success: boolean | "true" | "false";
  data: Mission[];
};

/** 미션 목록 조회 */
export const fetchMissions = async (): Promise<Mission[]> => {
  const { data } = await axiosInstance.get<MissionsResponse>(
    "/api/v1/missions"
  );

  return data?.data ?? [];
};
