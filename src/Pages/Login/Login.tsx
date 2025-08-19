import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import { useState } from "react";
import { requestLogin } from "../../api/Auth";
import { useNavigate } from "react-router-dom";
import { errorToast, warningToast } from "../../utils/ToastUtil/toastUtil";

const Login = () => {
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleLogin = async () => {
    if (!userInfo.email) {
      warningToast("이메일을 입력해주세요.");
      return;
    } else if (!userInfo.password) {
      warningToast("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await requestLogin(userInfo);

      if (res.data.success) {
        const token = res.headers["authorization"];

        if (token) {
          localStorage.setItem("accessToken", token);
          navigate("/");
          return;
        }
      }
    } catch (e) {
      errorToast("이메일 또는 비밀번호가 올바르지 않습니다.");
      setUserInfo({ email: "", password: "" });
    }
  };

  return (
    <div className={style.wrapper}>
      <p>구미, AI 미션형 지역 탐방</p>
      <img className={style.logo} src={LogoImg} />
      <div className={style.formBox}>
        <form className={style.form}>
          <input
            type="text"
            name="email"
            placeholder="이메일"
            value={userInfo.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={userInfo.password}
            onChange={handleChange}
          />
        </form>
        <button className={style.loginButton} onClick={handleLogin}>
          로그인
        </button>
      </div>
    </div>
  );
};

export default Login;
