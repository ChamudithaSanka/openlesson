import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return {
      token: null,
      authUser: null,
      userType: null,
      userId: null,
    };
  }

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const userType = localStorage.getItem("userType");
  const userId = localStorage.getItem("userId");

  let authUser = null;

  if (storedUser) {
    try {
      authUser = JSON.parse(storedUser);
    } catch {
      authUser = null;
    }
  }

  return {
    token,
    authUser,
    userType,
    userId,
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(readStoredAuth);

  useEffect(() => {
    const syncAuth = () => {
      setAuthState(readStoredAuth());
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  const setSession = ({ token, user }) => {
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userType", user.userType);
      localStorage.setItem("userId", user.id);
    }

    setAuthState({
      token: token || null,
      authUser: user || null,
      userType: user?.userType || null,
      userId: user?.id || null,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    setAuthState({
      token: null,
      authUser: null,
      userType: null,
      userId: null,
    });
  };

  const value = {
    token: authState.token,
    authUser: authState.authUser,
    userType: authState.userType,
    userId: authState.userId,
    isAuthenticated: Boolean(authState.token),
    setSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};