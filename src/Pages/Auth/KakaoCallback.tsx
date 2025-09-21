

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { tokenExchange } from "../../api/auth"; // 👈 auth.ts에 있는 함수
import { useAuth } from "../../contexts/auth";

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    // 📢 **3. 돌아온 사용자의 티켓(code) 확인 및 최종 입장 처리**
    const code = new URLSearchParams(location.search).get("code");

    if (code) {
      // 백엔드의 API 주소로 티켓(code)을 보내 진짜 입장권(Access Token)으로 교환
      tokenExchange(code)
        .then((res) => {
          const authHeader = res.headers["authorization"];
          const token = authHeader?.slice(7) ?? "";

          if (token) {
            localStorage.setItem("accessToken", token);
            setIsAuthenticated(true);
            navigate("/", { replace: true }); // 성공 시 메인 페이지로
          }
        })
        .catch((error) => {
          console.error("카카오 로그인 최종 처리 실패", error);
          navigate("/login", { replace: true }); // 실패 시 로그인 페이지로
        });
    } else {
      // code가 없는 경우 (비정상 접근)
      console.error("카카오 인증 코드를 받지 못했습니다.");
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]); // 이 페이지는 처음 렌더링될 때 한 번만 실행되면 됩니다.

  return <div>로그인 처리 중입니다...</div>;
};

export default KakaoCallback;