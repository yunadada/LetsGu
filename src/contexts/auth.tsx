import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction,
} from "react";

type AuthContextType = {
  isAuthenticated: boolean | null;
  setIsAuthenticated: Dispatch<SetStateAction<boolean | null>>;
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
