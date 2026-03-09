/**
 * AuthContext — global user session + WebSocket connection.
 * WebSocket is opened once after login and closed on logout.
 * All components can subscribe to WS events via useAuth().
 * On startup, the stored token is validated against /auth/me to handle expiry.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Start null; we verify on mount
  const [authLoading, setAuthLoading] = useState(true); // Prevent flash of login page
  const [wsEvents, setWsEvents] = useState([]);
  const wsRef = useRef(null);
  const intentionalClose = useRef(false); // Fix: prevent reconnect after logout

  const connectWS = useCallback((userId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    intentionalClose.current = false;
    const ws = new WebSocket(`${WS_URL}/ws/${userId}`);
    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        setWsEvents((prev) => [...prev.slice(-49), event]);
      } catch (_) {}
    };
    ws.onclose = () => {
      if (intentionalClose.current) return; // Don't reconnect on logout
      setTimeout(() => {
        if (localStorage.getItem("token")) connectWS(userId);
      }, 3000);
    };
    wsRef.current = ws;
  }, []);

  // On mount: verify stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthLoading(false);
      return;
    }
    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Token is valid — restore session from stored user data
        const stored = localStorage.getItem("user");
        const userData = stored ? JSON.parse(stored) : res.data;
        setUser(userData);
        if (userData?.user_id) connectWS(userData.user_id);
      })
      .catch(() => {
        // Token expired or invalid — clear storage and stay logged out
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, [connectWS]);

  const login = (tokenData) => {
    localStorage.setItem("token", tokenData.access_token);
    localStorage.setItem("user", JSON.stringify(tokenData));
    setUser(tokenData);
    if (tokenData?.user_id) connectWS(tokenData.user_id);
  };

  const logout = () => {
    intentionalClose.current = true;
    wsRef.current?.close();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, wsEvents, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
