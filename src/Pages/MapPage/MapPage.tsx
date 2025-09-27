import style from "./MapPage.module.css";
import { useEffect, useRef, useState } from "react";
import MissionActiveCard from "../../components/MissionActiveCard/MissionActiveCard";
import { getMarkerIcons } from "../../assets/icons/markerIcons";
import { useNavigate } from "react-router-dom";
import { useMissions } from "../../hooks/useMissions";
import { IoChevronBack } from "react-icons/io5";
import GuideBox from "../../components/GuideBox/GuideBox";
import BottomSheet from "../../components/BottomSlider/BottomSheet/BottomSheet";
import { warningToast } from "../../utils/ToastUtil/toastUtil";
export type Tab = "mission" | "review";

const MapPage = () => {
  const [tab, setTab] = useState<Tab>("mission");
  const [isShowGuideOpen, setIsShowGuideOpen] = useState(true);
  const [isShowGuideExiting, setIsShowGuideExiting] = useState(false);

  // Refs
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMissionRef = useRef<HTMLDivElement>(null);
  const topActiveBoxRef = useRef(false);

  // Page state
  const {
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
  } = useMissions();

  const navigate = useNavigate();

  const handleGuideOut = () => {
    if (isShowGuideExiting) {
      setIsShowGuideOpen(false);
    }
  };

  useEffect(() => {
    topActiveBoxRef.current = topActiveBox;
  }, [topActiveBox]);

  // 지도 초기화
  useEffect(() => {
    if (!mapDivRef.current || !window.google?.maps) return;
    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center: { lat: 36.1195, lng: 128.3446 },
      zoom: 16,
      disableDefaultUI: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "administrative",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },
      ],
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  // 미션 데이터를 기반으로 지도 위에 마커 표시
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (missions.length === 0) return;

    const icons = getMarkerIcons(window.google);
    const bounds = new google.maps.LatLngBounds();

    missions.forEach((m) => {
      const icon = m.isCompleted ? icons.COMPLETED : icons[m.placeCategory];
      const marker = new google.maps.Marker({
        position: { lat: m.latitude, lng: m.longitude },
        map,
        title: m.placeName,
        icon: { url: icon.url, scaledSize: icon.scaledSize },
      });
      marker.addListener("click", () => {
        setSelectedMission(m);
        console.log(topActiveBox);
        if (topActiveBoxRef.current) {
          warningToast(
            "이미 수락한 미션이 있습니다. 새로운 미션을 시작하려면 현재 미션을 종료해 주세요."
          );
          return;
        }

        setTab("mission");
        setSliderLevel("half");
      });
      markersRef.current.push(marker);
      bounds.extend({ lat: m.latitude, lng: m.longitude });
    });

    if (!bounds.isEmpty()) {
      if (missions.length === 1) {
        map.setCenter({
          lat: missions[0].latitude,
          lng: missions[0].longitude,
        });
        map.setZoom(16);
      } else {
        map.fitBounds(bounds);
      }
    }
  }, [missions]);

  useEffect(() => {
    if (!isShowGuideOpen) return;
    const timer = setTimeout(() => setIsShowGuideExiting(true), 2000);
    return () => clearTimeout(timer);
  }, [isShowGuideOpen]);

  // 아래 슬라이더바 올라왔을 때 지도를 클릭하면 슬라이더바 사라지도록
  useEffect(() => {
    if (!mapRef.current) return;

    const listener = mapRef.current.addListener("click", () => {
      setSliderLevel("closed");
      setSelectedMission(null);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [mapRef]);

  useEffect(() => {
    if (activeMission && activeMissionRef.current) {
      activeMissionRef.current.focus();
    }
  }, [activeMission]);

  return (
    <div className={style.mapPage}>
      <div className={style.mapContainer}>
        <div className={style.googleMap} ref={mapDivRef} />
      </div>

      <div
        className={`${style.mapOverlay} ${
          activeCollapsed ? style.activeCardOpen : ""
        }`}
      >
        <div className={style.mapHeader}>
          <button
            className={style.backButton}
            aria-label="뒤로가기"
            onClick={() => navigate("/")}
          >
            <IoChevronBack />
          </button>

          {isShowGuideOpen && (
            <div
              className={`${style.guideContainer} ${
                isShowGuideExiting ? style.exit : style.enter
              }`}
              onAnimationEnd={handleGuideOut}
            >
              <GuideBox text="지도 위의 핀을 눌러 여러 미션을 확인해 보세요!" />
            </div>
          )}
        </div>

        {activeMission && topActiveBox && (
          <MissionActiveCard
            mission={activeMission}
            collapsed={activeCollapsed}
            setActiveCollapsed={setActiveCollapsed}
            setActiveMission={setActiveMission}
            setSelectedMission={setSelectedMission}
            setTopActiveBox={setTopActiveBox}
          />
        )}
      </div>

      {selectedMission && sliderLevel !== "closed" && (
        <BottomSheet
          selectedMission={selectedMission}
          isOpen={activeCollapsed}
          setSliderLevel={setSliderLevel}
          tab={tab}
          setTab={setTab}
          acceptMission={acceptMission}
        />
      )}
    </div>
  );
};

export default MapPage;
