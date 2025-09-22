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
  tip:string;
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
 
   if (process.env.NODE_ENV !== "production") {
  console.debug("[mission] Fetched missions:", {
   success: data?.success,    count: Array.isArray(data?.data) ? data.data.length : 0,
  }); }

  return data?.data ?? [];
};
