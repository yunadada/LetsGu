import { createContext, useContext } from "react";

type AuthContextType = {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error(
      "AuthContext를 찾을 수 없습니다. App을 AuthContext.Provider로 감싸주세요."
    );
  return ctx;
};
