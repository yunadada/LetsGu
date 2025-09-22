import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { kakaoExchangeToken } from "../../api/auth";
import { useAuth } from "../../contexts/auth";
import Loading from "../../components/Loading/Loading";
import { errorToast } from "../../utils/ToastUtil/toastUtil";

const KakaoCallback = () => {
  const [searchParams] = useSearchParams();
  const tempToken = searchParams.get("code");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    const exchangeToken = async () => {
      if (!tempToken) {
        errorToast("유효하지 않은 요청입니다. 다시 시도해주세요.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const res = await kakaoExchangeToken(tempToken);
        const accessToken = res.data.data.accessToken;
        if (res.data.success === "true") {
          localStorage.setItem("accessToken", accessToken);
          setIsAuthenticated(true);
          navigate("/", { replace: true });
        } else {
          errorToast("로그인에 실패했습니다. 다시 시도해주세요.");
          navigate("/login", { replace: true });
        }
      } catch (e) {
        console.log(e);
        errorToast("서버 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/login", { replace: true });
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
