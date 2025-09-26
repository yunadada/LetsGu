import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import Kakao from "../../assets/Kakao.svg";
import { errorToast } from "../../utils/ToastUtil/toastUtil";
import { useEffect } from "react";

const Login = () => {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = import.meta.env.VITE_REACT_APP_KAKAO_AUTH_URL;
    if (!kakaoAuthUrl) {
      errorToast(
        "카카오 로그인에 일시적인 문제가 발생했습니다. 관리자에게 문의해주세요."
      );
      return;
    }

    window.location.href = kakaoAuthUrl;
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      localStorage.removeItem("accessToken");
    }
  }, []);

  return (
    <div className={style.wrapper}>
      <p>구미, AI 미션형 지역 탐방</p>
      <img className={style.logo} src={LogoImg} alt="레츠꾸 로고" />
      <div className={style.login}>
        <div className={style.loginDescription}>
          <div className={style.line}></div>
          <span>SNS로 시작하기</span>
          <div className={style.line}></div>
        </div>
        <button className={style.kakaoButton} onClick={handleKakaoLogin}>
          <img src={Kakao} alt="카카오 로그인" />
        </button>
      </div>
    </div>
  );
};

export default Login;
