import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import { useState } from "react";
import { requestLogin } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { errorToast, warningToast } from "../../utils/ToastUtil/toastUtil";
import type { ChangeEvent, FormEvent } from "react";
import type { LoginInput, UserInfo } from "../../types/userInfo";

const Login = () => {
  const [inputValue, setInputValue] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [userInfo, setUserInfo] = useState<UserInfo>({
    memberId: 0,
    email: "",
    nickname: "",
    imageUrl: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputValue.email) {
      warningToast("이메일을 입력해주세요.");
      return;
    } else if (!inputValue.password) {
      warningToast("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const res = await requestLogin(inputValue);

      if (res.data.success) {
        const info = res.data.data;

        // 임시로 프로필 이미지 로컬 스토리지에 저장
        if (info) {
          localStorage.setItem("profileImg", info.imageUrl);
        }
        setUserInfo(info);

        const authHeader = res.headers["authorization"];
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader ?? "";

        if (token) {
          localStorage.setItem("accessToken", token);
          navigate("/");
          return;
        }
      }
    } catch (e) {
      errorToast("이메일 또는 비밀번호가 올바르지 않습니다.");
      setInputValue({ email: "", password: "" });
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
            value={inputValue.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={inputValue.password}
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
