import style from "./MapPage.module.css";
import { useEffect, useRef, useState } from "react";
import BottomSlider from "../../components/BottomSlider/BottomSlider";
import MissionActiveCard from "../../components/MissionActiveCard/MissionActiveCard";
import { getMarkerIcons } from "../../assets/icons/markerIcons";
import duck from "../../assets/duck.png";
import { ReviewHero } from "./Review";
import { useNavigate } from "react-router-dom";
import pin from "../../assets/pin.svg";
import { formatDate } from "../../utils/dateUtils";
import { getFirstChar, truncate } from "../../utils/stringUtils";
import { useMissions } from "../../hooks/useMissions";
import { useReviews } from "../../hooks/useReviews";
import { IoChevronBack } from "react-icons/io5";
import GuideBox from "../../components/GuideBox/GuideBox";

export type Tab = "mission" | "review";

const MapPage = () => {
  const [tab, setTab] = useState<Tab>("mission");
  const [isShowGuideOpen, setIsShowGuideOpen] = useState(true);
  const [isShowGuideExiting, setIsShowGuideExiting] = useState(false);

  // Refs
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Page state
  const {
    missions,
    selectedMission,
    setSelectedMission,
    activeMission,
    setActiveMission,
    activeCollapsed,
    setActiveCollapsed,
    isMissionCompleted,
    isMissionAccepted,
    // acceptMission,
    startMission,
    errorMsg,
    sliderLevel,
    setSliderLevel,
  } = useMissions();

  const {
    data,
    // error,
    // nextPage,
    sortedReviews,
    hasReviews,
    reviewsLoading,
    reviewsError,
    sortOrder,
    setSortOrder,
    expanded,
    toggleExpand,
    // loadMore,
  } = useReviews({ selectedMission, tab });

  const navigate = useNavigate();

  const date = (d: string) => {
    const { year, month, day } = formatDate(d);
    const padMonth = month.padStart(2, "0");
    const padDay = day.padStart(2, "0");
    return `${year}.${padMonth}.${padDay}`;
  };

  const handleGuideOut = () => {
    if (isShowGuideExiting) {
      setIsShowGuideOpen(false);
    }
  };

  // 지도 초기화
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
      const icon = icons[m.placeCategory];
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

  useEffect(() => {
    if (!isShowGuideOpen) return;
    const timer = setTimeout(() => setIsShowGuideExiting(true), 2000);
    return () => clearTimeout(timer);
  }, [isShowGuideOpen]);

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

          {errorMsg && (
            <div className="error-banner" role="alert">
              {errorMsg}
              <button className="error-close">×</button>
            </div>
          )}

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

        {activeMission && (
          <div className="mission-active-floating">
            <MissionActiveCard
              description={activeMission.description}
              collapsed={activeCollapsed}
              onToggle={() => setActiveCollapsed((v) => !v)}
              onQuit={() => setActiveMission(null)}
              onCertify={() => startMission()}
              selectedMission={activeMission ?? selectedMission}
            />
          </div>
        )}
      </div>

      <BottomSlider
        isOpen={activeCollapsed}
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
                    리뷰 수 <strong>{data.count}</strong>
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
                  ) : !hasReviews ? (
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
                                  {getFirstChar(r.memberName)}
                                </div>
                                <div className="rv-meta">
                                  <div className="rv-name">{r.memberName}</div>
                                </div>
                                <time className="rv-date">
                                  {date(r.reviewDate)}
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

                      {/* {hasNext && (
                        <button
                          className="rv-more-btn"
                          onClick={loadMore}
                          disabled={loadingMore}
                          style={{
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                          }}
                        >
                          {loadingMore ? "불러오는 중..." : "더 보기"}
                        </button>
                      )} */}
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
              // const onClick = disabled
              //   ? () => {
              //       // setErrorMsg(
              //       //   completed
              //       //     ? "이미 완료한 미션이에요."
              //       //     : "이미 수락한 미션이에요."
              //       // );
              //       setSliderLevel("half");
              //     }
              //   : activeMission;

              return (
                <button
                  className={`cta ${disabled ? "is-disabled" : ""}`}
                  // onClick={onClick}
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
