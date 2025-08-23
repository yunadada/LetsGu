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
} from "../../api/missionReviews";
import pin from "../../assets/pin.svg";

type SliderLevel = "closed" | "half" | "full";
type Tab = "mission" | "review";

const MapPage: React.FC = () => {
  // Refs
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
  // scroll info
  const [nextId, setNextId] = useState<number | undefined>();
  const [hasNext, setHasNext] = useState(false);

  const navigate = useNavigate();

  const dropMission = () => {
    const mission = activeMission ?? selectedMission;
    if (!mission) return;
    navigate("/locationVerification", {
      state: { missionId: mission.missionId },
    });
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
        // ▼ 추가: 행정구역(동/리/읍/면/시 등) 라벨 끄기
        // 아래 항목들은 “부분적 제어용 예시”입니다.
        // - 위의 광범위 규칙(administrative.labels off)을 사용한다면 굳이 필요 없습니다.
        // - “시/군/구는 남기고 동/리만 지우기” 같은 미세 조정이 필요할 때,
        //   위의 광범위 규칙을 지우고, 아래 세부 규칙들 중 필요한 것만 주석 해제해 쓰세요.
        // - 스타일 규칙은 보통 '뒤에 오는 규칙'이 우선 적용되므로, 겹칠 경우 순서를 조정하세요.

        // {
        //   // sublocality = 동/읍/면 급 라벨 (예: 원평동, 도량동 / ○○읍, ○○면)
        //   // “시 이름은 남기고 동/리만 지우고 싶다”면 이 항목만 off 하세요.
        //   featureType: "administrative.sublocality",
        //   elementType: "labels",
        //   stylers: [{ visibility: "off" }],
        // },
        {
          // locality = 시/군/구 급 행정구역 라벨 (예: 구미시, 강남구 등)
          // 이걸 끄면 시/군/구 이름도 안 보입니다. (상위 도시명까지 숨김)
          featureType: "administrative.locality",
          elementType: "labels",
          stylers: [{ visibility: "on" }],
        },

        // {
        //   // neighborhood = 리/통/반 등 더 작은 생활권 단위 라벨
        //   // 세밀한 동네 표기(리/통/반)를 없애고 싶을 때 사용합니다.
        //   featureType: "administrative.neighborhood",
        //   elementType: "labels",
        //   stylers: [{ visibility: "off" }],
        // },

        // {
        //   // land_parcel = 지번(필지) 라벨 (예: 123-45 같은 표기)
        //   // 지번 텍스트가 지저분해 보일 때만 선택적으로 off 하세요.
        //   featureType: "administrative.land_parcel",
        //   elementType: "labels",
        //   stylers: [{ visibility: "off" }],
        // },
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
          console.log("[MapPage][Mission] 불러오기 성공 raw:", list);
          console.table(
            list.map((m) => ({
              id: m.missionId,
              name: m.placeName,
              category: m.placeCategory,
              lat: m.latitude,
              lng: m.longitude,
            }))
          );
        }
      } catch (e) {
        console.error("[MapPage][Mission] 불러오기 실패:", e);
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
          console.warn("[MapPage][Review] 리뷰 없음");
          setReviewsNotFound(true);
          return;
        }
        setReviews(list);
        setHasNext(hasNext);
        setNextId(nextId);

        console.log("[MapPage][Review] 프리뷰 raw:", list);
        console.table(
          list.map((r) => ({
            id: r.reviewId,
            user: r.memberName,
            date: r.reviewDate,
            content: r.reviewContent.slice(0, 30) + "...",
            image: r.reviewImageUrl,
          }))
        );
      } catch (e) {
        if (!alive) return;
        console.error("[MapPage][Review] 불러오기 실패:", e);
        setReviewsError("리뷰를 불러오지 못했어요.");
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab, selectedMission, sortOrder]);

  // load more
  const loadMoreReviews = async () => {
    if (!selectedMission || !hasNext) return;
    try {
      const res = await fetchMissionReviewsScroll({
        missionId: selectedMission.missionId,
        lastReviewId: nextId,
        sortType: sortOrder === "latest" ? "DESC" : "ASC",
      });
      setReviews((prev) => [...prev, ...res.items]);
      setHasNext(res.hasNext);
      setNextId(res.nextId);

      console.log("[MapPage][Review] 더 불러오기 raw:", res.items);
      console.table(
        res.items.map((r) => ({
          id: r.reviewId,
          user: r.memberName,
          date: r.reviewDate,
          content: r.reviewContent.slice(0, 30) + "...",
        }))
      );
    } catch (e) {
      console.error("[MapPage][Review] 더 불러오기 실패:", e);
    }
  };

  // load more observer
  useEffect(() => {
    if (!hasNext) return; // 다음 페이지 없으면 감시 중단
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log(
            "[MapPage][Review] 스크롤 끝 감지 → loadMoreReviews 실행"
          );
          loadMoreReviews();
        }
      },
      { threshold: 1.0 } // 100% 보여야 실행
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNext, loadMoreReviews]);

  // Tip auto-hide
  useEffect(() => {
    if (!showTip) return;
    const t = setTimeout(() => setShowTip(false), 1000);
    return () => clearTimeout(t);
  }, [showTip]);

  // accept mission
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
          <button
            className="appbar__back"
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
                        <div
                          ref={loadMoreRef}
                          style={{ padding: "20px", textAlign: "center" }}
                        >
                          불러오는 중...
                        </div>
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
