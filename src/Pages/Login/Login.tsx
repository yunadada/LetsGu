import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import { useState } from "react";
import { requestLogin } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { errorToast, warningToast } from "../../utils/ToastUtil/toastUtil";
import type { ChangeEvent, FormEvent } from "react";

const Login = () => {
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        const authHeader = res.headers["authorization"];
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;

        console.log("토큰", token);
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
      <form className={style.formBox} onSubmit={handleLogin}>
        <div className={style.form}>
          <input
            type="email"
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
        </div>
        <button className={style.loginButton} type="submit">
          로그인
        </button>
      </form>
    </div>
  );
};

export default Login;
