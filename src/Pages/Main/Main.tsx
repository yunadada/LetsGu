import style from "./Main.module.css";
import Arrow from "../../assets/Arrow.svg";
import ActivityImg from "../../assets/ActivityImg.svg";
import RewardImg from "../../assets/RewardImg.svg";
import WalletImg from "../../assets/WalletImg.svg";
import Coin from "../../assets/Coin.svg";
import MissionStartThumbnail from "../../assets/MissionStartThumbnail.svg";
import Weather from "../../components/Main/Weather/Weather";
import NavItem from "../../components/Main/NavItem/NavItem";
import { useEffect, useState } from "react";
import { getPoint, getWeather } from "../../api/main";
import type { HourlyWeather, WeatherInfo } from "../../types/weather";
import { getMypageData } from "../../api/user";
import type { UserProfileData } from "../../types/userInfo";
import { useNavigate } from "react-router-dom";
import { errorToast } from "../../utils/ToastUtil/toastUtil";
import { formatDate } from "../../utils/dateUtils";

const Main = () => {
  const [point, setPoint] = useState(0);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo>({
    temp: 0,
    icon: "",
    todayMax: 0,
    todayMin: 0,
  });
  const [hourlyWeather, setHourlyWeather] = useState<HourlyWeather[]>([]);
  const [userProfileData, setUserProfileData] =
    useState<UserProfileData | null>(null);
  const navigate = useNavigate();

  const { year, month, day } = formatDate();

  const navigiateToProfile = () => {
    navigate("/editProfile", { state: { userProfileData } });
  };

  const navigateToMission = () => {
    navigate("/map");
  };

  useEffect(() => {
    const getTodayWeather = async () => {
      try {
        const res = await getWeather();
        setWeatherInfo(res.data.data.current);
        setHourlyWeather(res.data.data.hourly6);
      } catch (e) {
        errorToast("날씨 정보를 불러오는데 실패했습니다.");
        console.log(e);
      }
    };

    const getUserPoint = async () => {
      try {
        const point = await getPoint();
        setPoint(point.data.data.point);
      } catch (e) {
        errorToast("포인트 내역을 불러오는데 실패했습니다.");
        console.log(e);
      }
    };

    const getUserProfileData = async () => {
      try {
        const res = await getMypageData();
        if (res.data.success) {
          console.log("프로필 사진:", res.data.data);
          setUserProfileData(res.data.data);
        }
      } catch (e) {
        errorToast("사용자 정보를 불러오는데 실패했습니다.");
        console.log(e);
      }
    };

    getTodayWeather();
    getUserPoint();
    getUserProfileData();
  }, []);

  return (
    <div className={style.wrapper}>
      <div className={style.header}>
        <div className={style.coin}>
          <img src={Coin} />
          <p>{point}</p>
        </div>
        <div className={style.profileImg} onClick={navigiateToProfile}>
          <img src={userProfileData?.imageUrl} alt="프로필" />
        </div>
      </div>
      <p className={style.date}>
        {year}년 {month}월 {day}일
      </p>
      <Weather weatherInfo={weatherInfo} hourlyWeather={hourlyWeather} />
      <div className={style.navArea}>
        <div className={style.navTop}>
          <NavItem thumbnail={ActivityImg} title="활동 내역" />
          <NavItem thumbnail={RewardImg} title="리워드 샵" />
          <NavItem thumbnail={WalletImg} title="내 지갑" />
        </div>
        <div className={style.navBottom} onClick={navigateToMission}>
          <img src={MissionStartThumbnail} alt="썸네일" />
          <div className={style.description}>
            <p>미션탐방을 즐기고 리워드를 받아보세요!</p>
            <div className={style.navTitle}>
              <h4>미션 수행하기</h4>
              <img src={Arrow} alt="이동" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
