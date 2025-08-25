// src/Pages/MapPage/MapPage.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import "./MapPage.css";
import BottomSlider from "../../components/BottomSlider/BottomSlider";
import MissionActiveCard from "../../components/MissionActiveCard/MissionActiveCard";
import { getMarkerIcons } from "../../assets/icons/markerIcons";
import type { MarkerCategory } from "../../assets/icons/markerIcons";
import { fetchMissions, type Mission } from "../../api/mission";
import duck from "../../assets/duck.png";
import { ReviewHero } from "./Review";
import { useNavigate } from "react-router-dom";
import alert from "../../assets/alert.png";
import {
  fetchMissionReviewsPreview,
  fetchMissionReviewsScroll,
  type Review,
  type SortType,
} from "../../api/missionReviews";
import pin from "../../assets/pin.svg";

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
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>(
    {}
  );
  // Error banner
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination (button-only)
  const [nextId, setNextId] = useState<number | undefined>();
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigate = useNavigate();

  // ===== Helpers: mission states =====
  const isMissionCompleted = (m?: Mission | null) => {
    if (!m) return false;
    // Case A: boolean flag from API
    if ((m as any).isCompleted === true) return true;
    // Case B: status strings (fallback)
    if ((m as any).status === "COMPLETED" || (m as any).progress === "DONE")
      return true;
    return false;
  };

  const isMissionAccepted = (m?: Mission | null) => {
    if (!m) return false;
    // Common boolean field names
    if ((m as any).isAccepted === true) return true;
    if ((m as any).accepted === true) return true;
    if ((m as any).joined === true) return true;
    // Fallback via status
    if ((m as any).status === "ACCEPTED" || (m as any).progress === "ACCEPTED")
      return true;
    return false;
  };

  const hasReviews = reviews.length > 0;
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

  // Map init
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
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
    };
  }, []);

  // fetch missions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchMissions();
        if (!cancelled) {
          setMissions(list);
        }
      } catch (e) {
        // console.error("[MapPage][Mission] fetch error:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // draw markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;
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

  // fetch reviews when tab=review
  useEffect(() => {
    if (tab !== "review" || !selectedMission) return;
    let alive = true;
    (async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      setReviews([]);
      setReviewsNotFound(false);
      try {
        const { list, notFound, hasNext, nextId } =
          await fetchMissionReviewsPreview(
            selectedMission.missionId,
            sortOrder === "latest" ? "DESC" : "ASC"
          );
        if (!alive) return;

        if (notFound) {
          setReviewsNotFound(true);
          return;
        }
        setReviews(list);
        setHasNext(hasNext);
        setNextId(nextId);
      } catch (e) {
        if (!alive) return;
        setReviewsError("리뷰를 불러오지 못했어요.");
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, selectedMission, sortOrder]);

  // "더 보기" 버튼으로만 페이지 추가
  const loadMoreReviews = useCallback(async () => {
    if (!selectedMission || !hasNext || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await fetchMissionReviewsScroll({
        missionId: selectedMission.missionId,
        lastReviewId: nextId,
        sortType: (sortOrder === "latest" ? "DESC" : "ASC") as SortType,
      });
      setReviews((prev) => [...prev, ...res.items]);
      setHasNext(res.hasNext);
      setNextId(res.nextId);
    } catch (e) {
      // console.error("[More] error", e);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedMission, hasNext, loadingMore, nextId, sortOrder]);

  // Tip auto-hide
  useEffect(() => {
    if (!showTip) return;
    const t = setTimeout(() => setShowTip(false), 2500);
    return () => clearTimeout(t);
  }, [showTip]);

  // accept mission (guarded)
  const acceptMission = useCallback(() => {
    if (!selectedMission) return;

    if (isMissionCompleted(selectedMission)) {
      setErrorMsg("이미 완료한 미션이에요.");
      setSliderLevel("half");
      return;
    }
    if (isMissionAccepted(selectedMission)) {
      setErrorMsg("이미 수락한 미션이에요.");
      setSliderLevel("half");
      return;
    }

    setActiveMission(selectedMission);
    setActiveCollapsed(false);
    setSliderLevel("closed");
    setShowTip(false);
  }, [selectedMission]);

  // certify navigation (guarded)
  const dropMission = () => {
    const mission = activeMission ?? selectedMission;
    if (!mission) return;
    if (isMissionCompleted(mission)) {
      setErrorMsg("이미 완료한 미션은 인증할 수 없어요.");
      setSliderLevel("half");
      return;
    }
    // 정책에 따라: 수락된 미션이면 인증 이동 허용 (일반적)
 navigate("/locationVerification", {
 state: {
    missionId: mission.missionId,
    placeName: mission.placeName,
 },
});
  };

  return (
    <div className="mapPage">
      <div className="mapContainer">
        <div className="googleMap" ref={mapDivRef} />
      </div>

      <div className={`overlay-root ${isOpen ? "sheet-open" : ""}`}>
        <div className="app-bar">
          <button
            className="app-bar__back"
            aria-label="뒤로가기"
            onClick={() => navigate("/")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
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

          {errorMsg && (
            <div className="error-banner" role="alert">
              {errorMsg}
              <button className="error-close" onClick={() => setErrorMsg(null)}>
                ×
              </button>
            </div>
          )}

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
        </div>

        {activeMission && (
          <div className="mission-active-floating">
            <MissionActiveCard
              description={activeMission.description}
              collapsed={activeCollapsed}
              onToggle={() => setActiveCollapsed((v) => !v)}
              onQuit={() => setActiveMission(null)}
              onCertify={() => dropMission()}
              selectedMission={activeMission ?? selectedMission}
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
              onClick={() => setTab("mission")}
            >
              미션
            </button>
            <button
              className={`seg__tab ${tab === "review" ? "is-active" : ""}`}
              onClick={() => {
                setTab("review");
                setSliderLevel("full");
              }}
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
                    <>
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
                              <p
                                className={`rv-text ${isOpen ? "is-open" : ""}`}
                              >
                                {text}
                              </p>
                              {r.reviewImageUrl && (
                                <img
                                  className="rv-img"
                                  src={r.reviewImageUrl}
                                  alt=""
                                />
                              )}
                              {r.reviewContent.length > 90 && (
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

                      {hasNext && (
                        <button
                          className="rv-more-btn"
                          onClick={loadMoreReviews}
                          disabled={loadingMore}
                          style={{
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                          }}
                        >
                          {loadingMore ? "불러오는 중..." : "더 보기"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )
          ) : selectedMission ? (
            <div className="mission-card">
              <div className="mission-pin" aria-hidden>
                <img src={pin} alt="" width={20} height={30} />
              </div>

              {/* 상태 뱃지 표시 */}
              <div className="mission-state" aria-live="polite">
                {isMissionCompleted(selectedMission) ? (
                  <span className="badge badge-done">완료</span>
                ) : isMissionAccepted(selectedMission) ? (
                  <span className="badge badge-accepted">수락됨</span>
                ) : null}
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
          {tab === "mission" &&
            selectedMission &&
            (() => {
              const accepted = isMissionAccepted(selectedMission);
              const completed = isMissionCompleted(selectedMission);
              const disabled = accepted || completed;
              const label = completed
                ? "완료된 미션"
                : accepted
                ? "이미 수락함"
                : "미션 수락하기";
              const onClick = disabled
                ? () => {
                    setErrorMsg(
                      completed
                        ? "이미 완료한 미션이에요."
                        : "이미 수락한 미션이에요."
                    );
                    setSliderLevel("half");
                  }
                : acceptMission;

              return (
                <button
                  className={`cta ${disabled ? "is-disabled" : ""}`}
                  onClick={onClick}
                  disabled={disabled}
                  aria-disabled={disabled}
                >
                  {label}
                </button>
              );
            })()}
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
