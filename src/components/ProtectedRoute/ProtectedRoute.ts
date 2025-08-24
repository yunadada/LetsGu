// src/components/ProtectedRoute/ProtectedRoute.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { warningToast } from "../../utils/ToastUtil/toastUtil";

type Props = {
  isAuthenticated: boolean | null;
  children: React.ReactNode;
};

export const ProtectedRoute = ({ isAuthenticated, children }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      warningToast("로그인을 해주세요.");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return null;
  }

  return isAuthenticated ? children : null;
};
