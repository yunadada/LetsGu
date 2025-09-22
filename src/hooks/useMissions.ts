// src/hooks/useMissions.ts
import { useEffect, useState, useCallback } from "react";
import { fetchMissions, type Mission } from "../api/mission";
import { useNavigate } from "react-router-dom";

type SliderLevel = "closed" | "half" | "full";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null); // 지도에서 선택한 미션
  const [activeMission, setActiveMission] = useState<Mission | null>(null); // 지도에서 실제로 수락한 미션
  const [activeCollapsed, setActiveCollapsed] = useState(false); // 하단 슬라이더 창

  const [errorMsg, setErrorMsg] = useState("");
  const [sliderLevel, setSliderLevel] = useState<SliderLevel>("closed");

  const navigate = useNavigate();

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

  // 완료 여부
  const isMissionCompleted = useCallback((m: Mission) => {
    if (!m) return false;
    return m.isCompleted;
  }, []);

  // 수락 여부
  const isMissionAccepted = useCallback((m: Mission) => {
    if (!m) return false;

    if (activeMission) {
      return true;
    }
    return false;
  }, []);

  // 미션 수락
  const acceptMission = useCallback(() => {
    // TODO: 지도에서 선택한 미션을 언제 담아두는지 확인
    if (!selectedMission) return;

    if (isMissionAccepted(selectedMission)) {
      setErrorMsg("이미 완료한 미션이에요.");
      setSliderLevel("half");
      return;
    }

    setActiveMission(selectedMission);
    setActiveCollapsed(false);
    setSliderLevel("closed");
  }, [selectedMission]);

  // 미션 중단
  const startMission = useCallback(() => {
    const mission = activeMission ?? selectedMission;
    if (!mission) return; // 방어 코드

    if (isMissionCompleted(mission)) {
      setErrorMsg("이미 완료한 미션은 인증할 수 없어요.");
      setSliderLevel("half");
      return;
    }

    navigate("/locationVerification", {
      state: { missionId: mission.missionId, placeName: mission.placeName },
    });
  }, []);

  return {
    missions,
    selectedMission,
    setSelectedMission,
    activeMission,
    setActiveMission,
    activeCollapsed,
    setActiveCollapsed,
    isMissionCompleted,
    isMissionAccepted,
    acceptMission,
    startMission,
    errorMsg,
    sliderLevel,
    setSliderLevel,
  };
}
