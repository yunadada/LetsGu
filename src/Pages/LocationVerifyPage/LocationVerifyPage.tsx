import LocationVerifiedTag from "../../components/LocationVerifiedTag/LocationVerifiedTag";
import style from "./LocationVerifyPage.module.css";
import Spinner from "../../assets/Spinner.gif";
import MapImg from "../../assets/MapImg.svg";
import Mark from "../../assets/MarkIcon.svg";
import Header from "../../components/Header/Header";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FailLocationVerifyModal from "../../components/Modal/FailLocationVerifyModal/FailLocationVerifyModal";
import type { UserLocation } from "../../types/location";
import axios from "axios";

const LocationVerifyPage = () => {
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const navigate = useNavigate();

  const getLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation API를 지원하지 않는 브라우저입니다.");
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
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("오류: 사용자가 위치 정보 제공을 거부했습니다.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("오류: 위치 정보를 사용할 수 없습니다.");
        break;
      case error.TIMEOUT:
        console.log("오류: 요청 시간이 초과되었습니다.");
        break;
      default:
        console.log("오류: 알 수 없는 오류가 발생했습니다.");
    }

    setIsModalOpen(true);
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const sendLocation = async () => {
      try {
        const res = await axios.post(
          `{SERVER}/api/v1/missions/{missionId}/gps`,
          userLocation
        );
        console.log(res);
        setIsLocationVerified(true);
      } catch (error) {
        setIsLocationVerified(false);
        setIsModalOpen(true);
      }
    };

    sendLocation();
  }, [userLocation]);

  useEffect(() => {
    if (!isLocationVerified) return;

    const redirectTimer = setTimeout(() => {
      navigate("/photoVerification");
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
        />
      )}
    </div>
  );
};

export default LocationVerifyPage;
