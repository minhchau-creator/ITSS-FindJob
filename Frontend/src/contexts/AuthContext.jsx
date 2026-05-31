import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE = "http://localhost:8080/api/v1";
const TOKEN_KEY = "itss_token";
const USER_KEY = "itss_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAuthResponse = (data) => {
    const { token, user: userData } = data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const loginWithGoogle = async (credential) => {
    const res = await axios.post(`${API_BASE}/auth/google`, { credential });
    return handleAuthResponse(res.data);
  };

  const loginWithEmail = async (email, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
    return handleAuthResponse(res.data);
  };

  const registerWithGoogle = async (credential, password, name) => {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      credential,
      password,
      name,
    });
    return handleAuthResponse(res.data);
  };

  const setPassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await axios.post(
      `${API_BASE}/auth/set-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data?.user) setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const res = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithGoogle,
        setPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
