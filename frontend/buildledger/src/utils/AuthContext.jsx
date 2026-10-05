import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getToken, setToken, removeToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(null); 
  const decodeUser = useCallback((jwt) => {
    if (!jwt) return null;
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return { username: payload.sub };
    } catch (_) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      setUser(decodeUser(token));
    } else {
      setUser(null);
    }
  }, [token, decodeUser]);

  const loginUser = useCallback((jwt) => {
    setToken(jwt);
    setTokenState(jwt);
  }, []);

  const logoutUser = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
