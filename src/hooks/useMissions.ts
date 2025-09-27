// src/hooks/useMissions.ts
import { useEffect, useState, useCallback } from "react";
import { fetchMissions, type Mission } from "../api/mission";
import { errorToast } from "../utils/ToastUtil/toastUtil";

export type SliderLevel = "closed" | "half" | "full";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null); // 지도에서 선택한 미션
  const [activeMission, setActiveMission] = useState<Mission | null>(null); // 지도에서 실제로 수락한 미션
  const [activeCollapsed, setActiveCollapsed] = useState(false); // 하단 슬라이더 창
  const [topActiveBox, setTopActiveBox] = useState(false);
  const [sliderLevel, setSliderLevel] = useState<SliderLevel>("closed");

  // 미션 목록 불러오기
  useEffect(() => {
    let cancelled = false;

    const getMissions = async () => {
      try {
        const list = await fetchMissions();
        if (!cancelled) setMissions(list);
      } catch (e) {
        console.error("미션 에러", e);
      }
    };

    getMissions();

    return () => {
      cancelled = true;
    };
  }, []);

  // 미션 수락하기
  const acceptMission = useCallback(() => {
    if (!selectedMission) return;

    if (activeMission) {
      errorToast("이미 완료한 미션이에요.");
      setSliderLevel("half");
      return;
    }

    setTopActiveBox(true);
    setActiveMission(selectedMission);
    setActiveCollapsed(false);
    setSliderLevel("closed");
  }, [
    selectedMission,
    activeMission,
    setActiveMission,
    setActiveCollapsed,
    setSliderLevel,
    setTopActiveBox,
  ]);

  return {
    missions,
    selectedMission,
    setSelectedMission,
    activeMission,
    setActiveMission,
    activeCollapsed,
    setActiveCollapsed,
    acceptMission,
    sliderLevel,
    setSliderLevel,
    setTopActiveBox,
    topActiveBox,
  };
}
