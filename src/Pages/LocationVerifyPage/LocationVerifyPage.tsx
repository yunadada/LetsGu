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
// import { errorToast } from "../../utils/ToastUtil/toastUtil";

const LocationVerifyPage = () => {
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [errorSentences, setErrorSentences] = useState({
    sentence1: "앗, 현재 위치를 파악할 수 없어요.",
    sentence2: "위치정보서비스(GPS)를 켜야 합니다.",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { missionId } = location.state as { missionId: number };
  // const missionId = 9;
  // console.log("미션 id:", typeof missionId, missionId);

  const getLocation = async () => {
    setUserLocation({ latitude: 36.3534358, longitude: 128.267985 });

    // if (!navigator.geolocation) {
    //   errorToast("Geolocation API를 지원하지 않는 브라우저입니다.");
    //   setIsModalOpen(true);
    //   return;
    // }

    // try {
    //   await new Promise((resolve, reject) => {
    //     navigator.geolocation.getCurrentPosition(
    //       (pos) => {
    //         onSuccess(pos);
    //         resolve(pos);
    //       },
    //       (err) => {
    //         onError(err);
    //         reject(err);
    //       },
    //       {
    //         enableHighAccuracy: true,
    //         timeout: 5000,
    //         maximumAge: 0,
    //       }
    //     );
    //   });
    // } catch (e) {
    //   console.log(e);
    // }

    // return;
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
        console.log("userLocation", userLocation);
        const res = await verifyLocation({ missionId, userLocation });
        console.log(res);
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
      navigate("/photoVerification", { state: { missionId: missionId } });
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
