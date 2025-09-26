// src/api/mission.ts
import type { MarkerCategory } from "../assets/icons/markerIcons";
import axiosInstance from "../lib/axiosInstance";

/** 서버가 내려주는 미션 타입 */
export type Mission = {
  address: string;
  missionId: number;
  placeName: string;
  description: string;
  latitude: number;
  longitude: number;
  placeCategory: MarkerCategory;
  tip: string;
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

  // if (process.env.NODE_ENV !== "production") {
  //   console.debug("[mission] Fetched missions:", {
  //     success: data?.success,
  //     count: Array.isArray(data?.data) ? data.data.length : 0,
  //   });
  // }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[mission] Fetched missions:", {
      success: data?.success,
      count: Array.isArray(data?.data) ? data.data.length : 0,
    });
  }

  const missions = data?.data ?? [];
  return missions.map((m) => ({ ...m, tip: m.tip ?? "" }));
};
