import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { kakaoExchangeToken } from "../../api/auth";
import { useAuth } from "../../contexts/auth";
import Loading from "../../components/Loading/Loading";

const KakaoCallback = () => {
  const [searchParams] = useSearchParams();
  const tempToken = searchParams.get("code");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    const exchangeToken = async () => {
      if (!tempToken) return;
      try {
        const res = await kakaoExchangeToken(tempToken);
        if (res.data.success === "true") {
          localStorage.setItem("accessToken", res.data.data.accessToken);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        }
      } catch (e) {
        console.log(e);
      }
    };

    exchangeToken();
  }, [tempToken, navigate, setIsAuthenticated]);

  return (
    <div>
      <Loading text="로그인 처리 중입니다." />
    </div>
  );
};

export default KakaoCallback;
