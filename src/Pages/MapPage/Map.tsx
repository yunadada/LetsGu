import React, { useEffect, useRef, useState } from "react";
import "./Map.css";
import BottomSlider from "../../components/BottomSlider/BottomSlider";
import { api } from "../../api/client";
import axios from "axios";
import { getMarkerIcons, categoryIcons } from "../../assets/icons/markerIcons";
import type { MarkerCategory } from "../../assets/icons/markerIcons";
import { fetchMissionReviews, type Review } from "../../api/reviews";
import { fetchMissions, type Mission } from "../../api/mission";
import duck from "../../assets/duck.png";

type SliderLevel = "closed" | "half" | "full";

//페이지 선언
const Map: React.FC = () => {
  // 지도 참조
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]); // 간단히 기본 Marker로 (경고만 뜨고 동작 OK)

  // UI 상태
  const [sliderLevel, setSliderLevel] = useState<SliderLevel>("closed");
  const isOpen = sliderLevel !== "closed";
  const [showTip, setShowTip] = useState(
    () => !localStorage.getItem("map_tip_seen")
  );
  const [tab, setTab] = useState<"mission" | "review">("mission");
  // 데이터 상태
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  // 상태 추가
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // ---- 로그인 (JWT 헤더에서 토큰 추출) ----
  const login = async (email: string, password: string) => {
    const res = await api.post("/api/v1/auth/login", { email, password });
    const auth = res.headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) {
      throw new Error(
        "Authorization 헤더가 없거나 CORS 노출 안 됨 (Access-Control-Expose-Headers: Authorization 필요)"
      );
    }
    localStorage.setItem("ACCESS_TOKEN", auth.slice(7));
    return res.data;
  };

  //서버에서 던지는 값이랑 다를 때 프론트 키와 맞춰줌
  const toIconCategory = (c: Mission["placeCategory"]): MarkerCategory => {
    const table: Record<string, MarkerCategory> = {
      ART_EXHIBITION_EXPERIENCE: "ART_EXHIBITION",
      CULTURE_HISTORY: "CULTURE_HISTORY",
      NATURE_PARK: "NATURE_PARK",
      FOOD_CAFE: "FOOD_CAFE",
      LIFE_CONVENIENCE: "LIFE_CONVENIENCE",
    };
    return table[c] ?? "LIFE_CONVENIENCE";
  };

  // 탭이 'review' 이고, 선택된 미션이 있을 때 불러오기
  useEffect(() => {
    if (tab !== "review" || !selectedMission) return;

    let alive = true; // 언마운트 후 setState 방지(경고 예방)

    (async () => {
      setReviewsLoading(true);
      setReviewsError(null);
      try {
        // ✅ 객체로 반환 -> 구조분해
        const { list, notFound } = await fetchMissionReviews(
          selectedMission.missionId
        );

        if (!alive) return;
        setReviews(list);

        // 404 전용 메시지
        if (notFound) setReviewsError("리뷰를 남기고 리워드를 받아보세요!");
      } catch {
        if (!alive) return;
        setReviewsError("리뷰를 불러오지 못했어요.");
        setReviews([]); // 에러 시 리스트 비우기
      } finally {
        if (alive) setReviewsLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [tab, selectedMission]);

  // 안내 토스트 자동 숨김
  useEffect(() => {
    if (!showTip) return;
    const t = setTimeout(() => {
      setShowTip(false);
      localStorage.setItem("map_tip_seen", "1");
    }, 3000);
    return () => clearTimeout(t);
  }, [showTip]);

  // 초기: 로그인 → 미션 불러오기
  useEffect(() => {
    (async () => {
      try {
        await login("dohoon@naver.com", "password1234");
        const list = await fetchMissions(); // ✅ 분리된 API 사용
        setMissions(list);
      } catch (e) {
        if (axios.isAxiosError(e)) {
          console.error(
            "초기 로그인/미션 실패:",
            e.response?.status,
            e.response?.data ?? e.message
          );
        } else {
          console.error(e);
        }
      }
    })();
  }, []);

  // 지도 생성 (1회)
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    const map = new google.maps.Map(mapRef.current, {
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
    mapObjRef.current = map;
  }, []);

  // 미션 → 마커 생성
  useEffect(() => {
    const map = mapObjRef.current;
    if (!map || missions.length === 0 || !window.google?.maps) return;

    // 기존 마커 정리
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const icons = getMarkerIcons(window.google);

    // 범위 맞추기
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
        setTab("mission"); // 또는 "review"
        setSliderLevel("half");
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: m.latitude, lng: m.longitude });
    });

    if (!bounds.isEmpty()) map.fitBounds(bounds);
  }, [missions]);

  console.log(missions);

  return (
    <div className="mapPage">
      <div className="mapContainer">
        <div className="googleMap" ref={mapRef} />
      </div>

      {showTip && (
        <div className="alert">
          지도위의 핀을 눌러 여러 미션을 확인해 보세요!
          <button
            className="alert__close"
            aria-label="닫기"
            onClick={() => {
              setShowTip(false);
              localStorage.setItem("map_tip_seen", "1");
            }}
          >
            ×
          </button>
        </div>
      )}

      <BottomSlider
        isOpen={isOpen}
        onClose={() => setSliderLevel("closed")} // ✅ 닫기 = 단계도 closed
        onOpen={() => setSliderLevel("half")} // ✅ 드래그로 열릴 때 기본은 half
        sliderLevel={sliderLevel}
        setSliderLevel={setSliderLevel}
      >
        <div className="sheet-inner">
          {/* 토글 */}
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

          {tab === "mission" ? (
            selectedMission ? (
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
              </div>
            ) : (
              <div className="mission-card">
                <p className="mission-empty">마커를 눌러 미션을 선택하세요.</p>
              </div>
            )
          ) : (
            <div className="mission-card" style={{ textAlign: "left" }}>
              <h3 className="mission-title" style={{ marginBottom: 12 }}>
                리뷰
              </h3>

              {reviewsLoading && <p className="mission-empty">불러오는 중…</p>}
              {reviewsError && <p className="mission-empty">{reviewsError}</p>}

              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <div>
                  <p className="mission-empty">아직 리뷰가 없어요.</p>
                  <img src={duck} />
                </div>
              )}

              {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                <div
                  className="review-list"
                  style={{ display: "grid", gap: 12 }}
                >
                  {reviews.map((r) => (
                    <div
                      key={r.reviewId}
                      className="review-item"
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: "0 4px 12px rgba(0,0,0,.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ fontSize: 13 }}>{r.memberName}</strong>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>
                          {new Date(r.reviewDate).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: 1.5,
                          margin: "6px 0",
                        }}
                      >
                        {r.reviewContent}
                      </p>
                      {r.reviewImageUrl && (
                        <img
                          src={r.reviewImageUrl}
                          alt=""
                          style={{
                            width: "100%",
                            borderRadius: 10,
                            display: "block",
                            marginTop: 6,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "mission" && selectedMission && (
            <button className="cta">미션 수락하기</button>
          )}
        </div>
      </BottomSlider>
    </div>
  );
};

export default Map;
