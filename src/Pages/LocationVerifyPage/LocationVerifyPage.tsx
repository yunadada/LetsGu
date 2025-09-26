import LocationVerifiedTag from "../../components/LocationVerifiedTag/LocationVerifiedTag";
import style from "./LocationVerifyPage.module.css";
import Spinner from "../../assets/Spinner.gif";
import MapImg from "../../assets/MapImg.svg";
import Mark from "../../assets/MarkIcon.svg";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FailLocationVerifyModal from "../../components/Modal/FailLocationVerifyModal/FailLocationVerifyModal";
import type { UserLocation } from "../../types/location";
import { verifyLocation } from "../../api/MissionVerification/MissionVerification";
import { errorToast } from "../../utils/ToastUtil/toastUtil";
// import { errorToast } from "../../utils/ToastUtil/toastUtil";

const LocationVerifyPage = () => {
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [errorSentences, setErrorSentences] = useState({
    sentence1: "앗, 현재 위치를 파악할 수 없어요.",
    sentence2: "위치정보서비스(GPS)를 켜야 합니다.",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const { missionId, placeName } = location.state as {
    missionId: number;
    placeName: string;
  };

  const getLocation = async () => {
    // setUserLocation({ latitude: 36.2558861, longitude: 128.3982031 }); // 도리사
    // setUserLocation({ latitude: 36.1307032, longitude: 128.4223197 }); // 다온숲
    // setUserLocation({ latitude: 36.1817657, longitude: 128.350103 }); // 모에누
    // setUserLocation({ latitude: 36.3534358, longitude: 128.3534358 }); // 토몽도
    // setUserLocation({ latitude: 36.1305388, longitude: 128.3299076 }); // 구미 새마을 중앙시장
    // return;

    if (!navigator.geolocation) {
      errorToast("Geolocation API를 지원하지 않는 브라우저입니다.");
      setIsModalOpen(true);
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onSuccess(pos);
            resolve(pos);
          },
          (err) => {
            onError(err);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      });
    } catch (e) {
      errorToast("사용자 위치를 찾을 수 없습니다.");
      console.log(e);
    }

    return;
  };

  const onSuccess = (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    setUserLocation({ latitude: lat, longitude: lon });
  };

  const onError = (error: GeolocationPositionError) => {
    console.log(error.code);
    setIsModalOpen(true);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const sendLocation = async () => {
      try {
        const res = await verifyLocation({ missionId, userLocation });
        setImgUrl(res.data.data);
        setIsLocationVerified(true);
      } catch (error) {
        console.log(error);
        setErrorSentences({
          sentence1: "앗, 미션 위치 범위에서 벗어났어요.",
          sentence2: "미션장소로 가볼까요?",
        });
        setIsLocationVerified(false);
        setIsModalOpen(true);
      }
    };

    sendLocation();
  }, [userLocation]);

  useEffect(() => {
    if (!isLocationVerified) return;

    const redirectTimer = setTimeout(() => {
      navigate("/photoVerification", {
        state: { missionId: missionId, placeName: placeName, imgUrl: imgUrl },
        replace: true,
      });
    }, 1500);
    return () => clearTimeout(redirectTimer);
  }, [isLocationVerified, navigate]);

  return (
    <div className={style.wrapper}>
      <Header title={"미션 인증하기"} />
      <div className={style.subTitle}>
        <img src={Mark}></img>
        <p>위치 인증하기</p>
      </div>
      <div className={style.content}>
        {!isModalOpen && (
          <>
            <h4>위치 확인 중</h4>
            <p>위치를 확인하고 있어요.</p>
            <img src={MapImg} alt="지도 이미지" className={style.map}></img>
            <div className={style.statusBox}>
              {isLocationVerified ? (
                <LocationVerifiedTag />
              ) : (
                <img
                  src={Spinner}
                  alt="로딩중..."
                  className={style.loading}
                ></img>
              )}
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <FailLocationVerifyModal
          handleModal={setIsModalOpen}
          retryLocationVerification={getLocation}
          errorSentences={errorSentences}
        />
      )}
    </div>
  );
};

export default LocationVerifyPage;
