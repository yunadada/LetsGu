import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import Kakao from "../../assets/Kakao.svg";

const BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL;

const Login = () => {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `${BASE_URL}/oauth2/authorization/kakao`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className={style.wrapper}>
      <p className={style.logoText}>구미, AI 미션형 지역 탐방</p>
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
