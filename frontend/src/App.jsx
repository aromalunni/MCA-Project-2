import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import SalonFinder from "./pages/SalonFinder";
import FaceAnalysis from "./pages/FaceAnalysis";
import AppointmentTracker from "./pages/AppointmentTracker";
import "./styles/global.css";
import "./styles/user-pages.css";
import "./styles/admin-dashboard.css";
import "./styles/ecom-store.css";

// ── Loading spinner shown while verifying stored token ──────────────────────
function AuthLoadingScreen() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "100vh",
      background: "linear-gradient(135deg, #6c47ff 0%, #ec4899 100%)",
      gap: "1rem",
    }}>
      <div style={{
        width: 56, height: 56, border: "4px solid rgba(255,255,255,0.3)",
        borderTopColor: "white", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "white", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>SmartSalon</p>
    </div>
  );
}

// ── 404 Not Found page ───────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", gap: "1rem", textAlign: "center",
    }}>
      <div style={{ fontSize: "5rem", fontWeight: 900, color: "#6c47ff" }}>404</div>
      <h2 style={{ margin: 0, color: "#1e293b" }}>Page Not Found</h2>
      <p style={{ color: "#64748b", margin: 0 }}>The page you're looking for doesn't exist.</p>
      <a href="/" style={{
        background: "linear-gradient(135deg, #6c47ff, #ec4899)",
        color: "white", padding: "0.75rem 2rem", borderRadius: 12,
        textDecoration: "none", fontWeight: 700, marginTop: "0.5rem",
      }}>Go Home</a>
    </div>
  );
}

// ── Access Denied page ───────────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "80vh", gap: "1rem", textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem" }}>🔒</div>
      <h2 style={{ margin: 0, color: "#1e293b" }}>Access Denied</h2>
      <p style={{ color: "#64748b", margin: 0 }}>You don't have permission to view this page.</p>
      <a href="/booking" style={{
        background: "linear-gradient(135deg, #6c47ff, #ec4899)",
        color: "white", padding: "0.75rem 2rem", borderRadius: 12,
        textDecoration: "none", fontWeight: 700, marginTop: "0.5rem",
      }}>Go to Booking</a>
    </div>
  );
}

// ── Route guard for authenticated users ─────────────────────────────────────
function PrivateRoute({ children, adminOnly = false }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.is_admin) return <AccessDenied />;
  return children;
}

// Pages where the app navbar should NOT show (landing, login, register have their own nav)
const HIDE_NAVBAR = ["/", "/login", "/register", "/admin"];

function AppRoutes() {
  const location = useLocation();
  const { authLoading } = useAuth();
  const showNavbar = !HIDE_NAVBAR.includes(location.pathname);

  if (authLoading) return <AuthLoadingScreen />;

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/salons" element={<PrivateRoute><SalonFinder /></PrivateRoute>} />
        <Route path="/face-analysis" element={<PrivateRoute><FaceAnalysis /></PrivateRoute>} />
        <Route path="/appointments" element={<PrivateRoute><AppointmentTracker /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatBot />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
