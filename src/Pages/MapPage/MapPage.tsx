import React, { useEffect, useRef, useState, useCallback } from "react";
import "./MapPage.css";
import BottomSlider from "../../components/BottomSlider/BottomSlider";
import MissionActiveCard from "../../components/MissionActiveCard/MissionActiveCard";
import { getMarkerIcons, categoryIcons } from "../../assets/icons/markerIcons";
import type { MarkerCategory } from "../../assets/icons/markerIcons";
import { fetchMissionReviews, type Review } from "../../api/reviews";
import { fetchMissions, type Mission } from "../../api/mission";
import duck from "../../assets/duck.png";
import { ReviewHero } from "./Review";
import { useNavigate } from "react-router-dom";
import alert from "../../assets/alert.png";
// import axiosInstance from "../../lib/axiosInstance";

type SliderLevel = "closed" | "half" | "full";
type Tab = "mission" | "review";

const MapPage: React.FC = () => {
  // Refs
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Page state
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [activeCollapsed, setActiveCollapsed] = useState(false);
  const [sliderLevel, setSliderLevel] = useState<SliderLevel>("closed");
  const [tab, setTab] = useState<Tab>("mission");
  const isOpen = sliderLevel !== "closed";
  const [showTip, setShowTip] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsNotFound, setReviewsNotFound] = useState(false);
  // 정렬/펼침 상태
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>(
    {}
  );

  const dropMission = () => {
    const mission = activeMission ?? selectedMission;

    if (!mission) return;
    navigate("/locationVerification", {
      state: { missionId: mission.missionId },
    }); // ✅ state로 전달
    //console.log(mission.missionId);
  };

  const hasReviews = Array.isArray(reviews) && reviews.length > 0;
  const navigate = useNavigate();
  const toggleExpand = (id: string | number) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const formatDate = (d: string | number | Date) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const truncate = (t: string, n = 80) =>
    t.length > n ? t.slice(0, n) + "…" : t;

  const initials = (name?: string) => (name ?? "").trim().slice(0, 1) || "?";

  const sortedReviews = React.useMemo(() => {
    const arr = [...reviews];
    arr.sort((a, b) => {
      const ta = new Date(a.reviewDate).getTime();
      const tb = new Date(b.reviewDate).getTime();
      return sortOrder === "latest" ? tb - ta : ta - tb;
    });
    return arr;
  }, [reviews, sortOrder]);
  // Map init (once)
  useEffect(() => {
    if (!mapDivRef.current || !window.google?.maps) return;
    mapRef.current = new google.maps.Map(mapDivRef.current, {
      center: { lat: 36.1195, lng: 128.3446 },
      zoom: 13,
      disableDefaultUI: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "poi.business",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    return () => {
      // cleanup markers on unmount
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  //간이 로그인

  // const DEV_EMAIL = import.meta.env.VITE_DEV_EMAIL;
  // const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // if (import.meta.env.DEV) {
        //   if (!localStorage.getItem("ACCESS_TOKEN")) {
        //     const res = await axiosInstance.post("/api/v1/auth/login", {
        //       email: DEV_EMAIL,
        //       password: DEV_PASSWORD,
        //     });
        //     const headers = res.headers as unknown as Record<
        //       string,
        //       string | undefined
        //     >;
        //     const auth = headers["authorization"] ?? headers["Authorization"];
        //     if (!auth?.startsWith("Bearer ")) {
        //       throw new Error("Authorization 헤더 노출 필요");
        //     }
        //     localStorage.setItem("ACCESS_TOKEN", auth.slice(7));
        //   }
        // }
        const list = await fetchMissions();
        console.log(list);
        if (!cancelled) setMissions(list);
      } catch (e) {
        console.error("초기 로그인/미션 실패:", e);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []); // 인라인이면 이 두 값만 의존
  // }, [DEV_EMAIL, DEV_PASSWORD]); // 인라인이면 이 두 값만 의존

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
    // 항상 이전 마커 정리
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (missions.length === 0) return;

    const icons = getMarkerIcons(window.google);
    const bounds = new google.maps.LatLngBounds();

    missions.forEach((m) => {
      const cat = toIconCategory(m.placeCategory);
      const icon = icons[cat];

      const marker = new google.maps.Marker({
        position: { lat: m.latitude, lng: m.longitude },
        map,
        title: m.placeName,
        icon: { url: icon.url, scaledSize: icon.scaledSize },
      });

      marker.addListener("click", () => {
        setSelectedMission(m);
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
  // Load reviews when: tab=review && selectedMission
  useEffect(() => {
    if (tab !== "review" || !selectedMission) return;

    let alive = true; // cleanup까지 살아 있음 표시

    (async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      setReviews([]);
      setReviewsNotFound(false);

      try {
        const { list, notFound } = await fetchMissionReviews(
          selectedMission.missionId
        );
        if (!alive) return; // 늦게 온 응답 무시

        if (notFound) {
          setReviewsNotFound(true);
          return;
        }

        type ReviewListWire =
          | Review[]
          | { missionReviewResponse?: Review[] | null | undefined };

        const wire = list as ReviewListWire;

        const normalized: Review[] = Array.isArray(wire)
          ? wire
          : Array.isArray(wire.missionReviewResponse)
          ? wire.missionReviewResponse!
          : [];
        setReviews(normalized);
      } catch {
        if (!alive) return;
        setReviewsError("리뷰를 불러오지 못했어요.");
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();

    return () => {
      alive = false;
    }; // 의존성 변경/언마운트 시 안전 종료
  }, [tab, selectedMission]);

  // Tip auto-hide
  useEffect(() => {
    if (!showTip) return;
    const t = setTimeout(() => {
      setShowTip(false);
      // localStorage.setItem("map_tip_seen", "1");
    }, 10000);
    return () => clearTimeout(t);
  }, [showTip]);

  // Handlers
  const acceptMission = useCallback(() => {
    if (!selectedMission) return;
    setActiveMission(selectedMission);
    setActiveCollapsed(false);
    setSliderLevel("closed");
    setShowTip(false);
  }, [selectedMission]);

  return (
    <div className="mapPage">
      <div className="mapContainer">
        <div className="googleMap" ref={mapDivRef} />
      </div>

      <div className="overlay-root">
        <header className="appbar">
          {/* <button onClick={devLogin}>devLogin</button> */}
          <button
            className="appbar__back"
            aria-label="뒤로가기"
            onClick={() => {
              navigate("/");
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <h1 className="appbar__title">미션 지도</h1>
          {showTip && (
            <div className={`tip-floating ${activeMission ? "with-card" : ""}`}>
              <img
                className="tip-floating__icon"
                src={alert}
                alt=""
                aria-hidden
              />
              <p className="tip-floating__text">
                지도위의 핀을 눌러 여러 미션을 확인해 보세요!
              </p>
              <button
                className="tip-floating__close"
                aria-label="닫기"
                onClick={() => setShowTip(false)}
              >
                ×
              </button>
            </div>
          )}
          <div className="appbar__spacer" />
        </header>
        {activeMission && (
          <div className="mission-active-floating">
            <MissionActiveCard
              description={activeMission.description}
              collapsed={activeCollapsed}
              onToggle={() => setActiveCollapsed((v) => !v)}
              onQuit={() => setActiveMission(null)}
              onCertify={() => {
                dropMission();
              }}
              selectedMission={activeMission ?? selectedMission} // ✅ 이게 더 안전
            />
          </div>
        )}
      </div>

      <BottomSlider
        isOpen={isOpen}
        onClose={() => setSliderLevel("closed")}
        onOpen={() => setSliderLevel("half")}
        sliderLevel={sliderLevel}
        setSliderLevel={setSliderLevel}
      >
        <div className="sheet-inner">
          {/* Tabs */}
          <div className="seg" role="tablist" aria-label="미션/리뷰 탭">
            <button
              className={`seg__tab ${tab === "mission" ? "is-active" : ""}`}
              role="tab"
              aria-selected={tab === "mission"}
              onClick={() => setTab("mission")}
            >
              미션
            </button>
            <button
              className={`seg__tab ${tab === "review" ? "is-active" : ""}`}
              role="tab"
              aria-selected={tab === "review"}
              onClick={() => setTab("review")}
            >
              리뷰
            </button>
          </div>

          {/* Body */}
          {tab === "review" ? (
            !selectedMission ? (
              <ReviewHero />
            ) : (
              <>
                {/* ✅ 리뷰 툴바: mission-card 밖으로 이동 */}
                <div className="rv-toolbar">
                  <span className="rv-toolbar__count">
                    리뷰 수 <strong>{reviews.length}</strong>
                  </span>
                  <button
                    className="rv-toolbar__sort"
                    onClick={() =>
                      setSortOrder((s) =>
                        s === "latest" ? "oldest" : "latest"
                      )
                    }
                  >
                    ↕ {sortOrder === "latest" ? "최신순" : "오래된순"}
                  </button>
                </div>

                {/* 리스트 카드(기존 mission-card) */}
                <div className="mission-card review-sheet">
                  {reviewsLoading ? (
                    <p className="mission-empty">불러오는 중…</p>
                  ) : reviewsError ? (
                    <p className="mission-empty">{reviewsError}</p>
                  ) : reviewsNotFound || !hasReviews ? (
                    <div
                      className="review-empty"
                      style={{ textAlign: "center" }}
                    >
                      <p className="mission-empty">
                        리뷰를 남기고 <strong>리워드</strong>를 받아보세요!
                      </p>
                      <img className="duck" src={duck} alt="리뷰 없음" />
                    </div>
                  ) : (
                    <div className="rv-list">
                      {sortedReviews.map((r) => {
                        const isOpen = !!expanded[r.reviewId];
                        const text = isOpen
                          ? r.reviewContent
                          : truncate(r.reviewContent, 90);
                        return (
                          <article key={r.reviewId} className="rv-card">
                            <div className="rv-top">
                              <div className="rv-avatar" aria-hidden>
                                {initials(r.memberName)}
                              </div>
                              <div className="rv-meta">
                                <div className="rv-name">{r.memberName}</div>
                              </div>
                              <time className="rv-date">
                                {formatDate(r.reviewDate)}
                              </time>
                            </div>
                            <p className={`rv-text ${isOpen ? "is-open" : ""}`}>
                              {text}
                            </p>
                            {r.reviewImageUrl && (
                              <img
                                className="rv-img"
                                src={r.reviewImageUrl}
                                alt=""
                              />
                            )}
                            {r.reviewContent && r.reviewContent.length > 90 && (
                              <button
                                className="rv-more"
                                onClick={() => toggleExpand(r.reviewId)}
                              >
                                {isOpen ? "접기" : "더보기"}
                              </button>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )
          ) : selectedMission ? (
            <div className="mission-card">
              <div className="mission-pin" aria-hidden>
                <img
                  src={
                    categoryIcons[
                      (selectedMission.placeCategory in categoryIcons
                        ? selectedMission.placeCategory
                        : "LIFE_CONVENIENCE") as MarkerCategory
                    ]
                  }
                  alt=""
                  width={20}
                  height={30}
                />
              </div>

              <h3 className="mission-title" style={{ marginTop: 4 }}>
                {selectedMission.description}
              </h3>

              <p className="mission-address">{selectedMission.placeName}</p>
              <p className="mission-address">{selectedMission.address}</p>
            </div>
          ) : (
            <div className="mission-card">
              <p className="mission-empty">마커를 눌러 미션을 선택하세요.</p>
            </div>
          )}

          {/* CTA */}
          {tab === "mission" && selectedMission && (
            <button className="cta" onClick={acceptMission}>
              미션 수락하기
            </button>
          )}
        </div>
      </BottomSlider>
    </div>
  );
};

export default MapPage;

// utils
function toIconCategory(c: Mission["placeCategory"]): MarkerCategory {
  const table: Record<string, MarkerCategory> = {
    ART_EXHIBITION_EXPERIENCE: "ART_EXHIBITION",
    CULTURE_HISTORY: "CULTURE_HISTORY",
    NATURE_PARK: "NATURE_PARK",
    FOOD_CAFE: "FOOD_CAFE",
    LIFE_CONVENIENCE: "LIFE_CONVENIENCE",
  };
  return table[c] ?? "LIFE_CONVENIENCE";
}
