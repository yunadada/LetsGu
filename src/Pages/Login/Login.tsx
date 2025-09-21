import style from "./Login.module.css";
import LogoImg from "../../assets/Logo.svg";
import kakaoIcon from "../../assets/kakao.png";
import { Link } from "react-router-dom";

const Login = () => {
  const KAKAO_AUTH_URL =
    "https://letsggu.duckdns.org/oauth2/authorization/kakao";

  return (
    <div className={style.wrapper}>
      <p>구미, AI 미션형 지역 탐방</p>
      <img className={style.logo} src={LogoImg} alt="레츠꾸 로고" />

      {/* 👇 [추가된 부분] SNS로 시작하기 텍스트와 구분선 */}
      <div className={style.snsLogin}>
        <div className={style.line}></div>
        <span>SNS로 시작하기</span>
        <div className={style.line}></div>
      </div>
      {/* 👆 [추가된 부분] */}

      <Link to={KAKAO_AUTH_URL} className={style.kakaoButton}>
        <img src={kakaoIcon} alt="카카오 로그인" />
      </Link>
    </div>
  );
};

export default Login;

// import style from "./Login.module.css";
// import LogoImg from "../../assets/Logo.svg";
// import { useState } from "react";
// import { requestLogin } from "../../api/auth";
// import { useLocation, useNavigate } from "react-router-dom";
// import { errorToast, warningToast } from "../../utils/ToastUtil/toastUtil";
// import type { ChangeEvent, FormEvent } from "react";
// import type { LoginInput } from "../../types/userInfo";
// import { useAuth } from "../../contexts/auth";

// const Login = () => {
//   const { setIsAuthenticated } = useAuth();

//   const [inputValue, setInputValue] = useState<LoginInput>({
//     email: "",
//     password: "",
//   });

//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setInputValue({ ...inputValue, [name]: value });
//   };

//   const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!inputValue.email) {
//       warningToast("이메일을 입력해주세요.");
//       return;
//     } else if (!inputValue.password) {
//       warningToast("비밀번호를 입력해주세요.");
//       return;
//     }

//     try {
//       const res = await requestLogin(inputValue);

//       if (res.data.success) {
//         const authHeader = res.headers["authorization"];
//         const token = authHeader?.startsWith("Bearer ")
//           ? authHeader.slice(7)
//           : authHeader ?? "";

//         if (token) {
//           localStorage.setItem("accessToken", token);
//           setIsAuthenticated(true);

//           const fromPath = location.state?.from?.pathname || "/";
//           navigate(fromPath, { replace: true });
//           return;
//         } else {
//           errorToast("토큰 발급에 실패했습니다. 다시 로그인해주세요.");
//           navigate("/login", { replace: true });
//         }
//       }
//     } catch (e) {
//       errorToast("이메일 또는 비밀번호가 올바르지 않습니다.");
//       setInputValue({ email: "", password: "" });
//       console.log(e);
//     }
//   };

//   return (
//     <div className={style.wrapper}>
//       <p>구미, AI 미션형 지역 탐방</p>
//       <img className={style.logo} src={LogoImg} />
//       <form className={style.formBox} onSubmit={handleLogin}>
//         <div className={style.form}>
//           <input
//             type="email"
//             name="email"
//             placeholder="이메일"
//             value={inputValue.email}
//             onChange={handleChange}
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="비밀번호"
//             value={inputValue.password}
//             onChange={handleChange}
//           />
//         </div>
//         <button className={style.loginButton} type="submit">
//           로그인
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;
