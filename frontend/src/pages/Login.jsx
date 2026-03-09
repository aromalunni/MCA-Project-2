import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Scissors, ArrowRight, ArrowLeft, Lock, User, Sparkles, Eye, EyeOff, Calendar, Star, Clock } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data);
      navigate(res.data.is_admin ? "/admin" : "/booking");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modern">
      {/* Back to Home */}
      <Link to="/" className="auth-back-btn">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </Link>

      {/* Left — Branding */}
      <div className="auth-modern-left">
        <div className="auth-modern-bg">
          <img src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?auto=format&fit=crop&q=80&w=1000" alt="Premium Salon Setup" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, position: 'absolute', top: 0, left: 0 }} />
          <div className="auth-modern-orb auth-modern-orb-1" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3), transparent 60%)" }} />
          <div className="auth-modern-orb auth-modern-orb-2" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 60%)" }} />
          <div className="auth-modern-orb auth-modern-orb-3" />
          <div className="auth-modern-grid" />
        </div>
        <div className="auth-modern-left-content">
          <Link to="/" className="auth-modern-logo">
            <div className="auth-modern-logo-icon">
              <Scissors size={22} />
            </div>
            SmartSalon
          </Link>
          <h2>Welcome to SmartSalon Luxe</h2>
          <p>Sign in to manage your appointments, discover premium styles, and enjoy our exclusive membership perks.</p>
          <div className="auth-modern-features">
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><Calendar size={16} /></div>
              <div>
                <strong>Smart Booking</strong>
                <span>Book appointments in seconds</span>
              </div>
            </div>
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}><Star size={16} /></div>
              <div>
                <strong>Elite Membership</strong>
                <span>Exclusive perks & early access</span>
              </div>
            </div>
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Sparkles size={16} /></div>
              <div>
                <strong>Luxury Treatments</strong>
                <span>World-class beauty care</span>
              </div>
            </div>
          </div>
          <div className="auth-modern-testimonial">
            <p>"SmartSalon's new luxurious experience is absolutely unmatched. The VIP perks are amazing!"</p>
            <div className="auth-modern-testimonial-author">
              <div className="auth-modern-testimonial-avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>A</div>
              <div>
                <strong>Aishwarya R.</strong>
                <span>VIP Member</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-modern-right">
        <div className="auth-modern-form-container">
          <div className="auth-modern-form-header">
            <div className="auth-modern-form-badge">Welcome back</div>
            <h1>Sign In</h1>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && <div className="auth-modern-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={`auth-modern-field ${focused === "name" ? "focused" : ""} ${form.name ? "filled" : ""}`}>
              <label>Username</label>
              <div className="auth-modern-input-wrap">
                <User size={18} className="auth-modern-input-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                />
              </div>
            </div>

            <div className={`auth-modern-field ${focused === "password" ? "focused" : ""} ${form.password ? "filled" : ""}`}>
              <label>Password</label>
              <div className="auth-modern-input-wrap">
                <Lock size={18} className="auth-modern-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                />
                <button type="button" className="auth-modern-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-modern-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: "1.2rem", height: "1.2rem" }} />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-modern-divider">
            <span>New to SmartSalon?</span>
          </div>

          <Link to="/register" className="auth-modern-alt-btn">
            Create an Account <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
