import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Scissors, ArrowRight, ArrowLeft, Lock, User, Mail, Phone, Shield, Sparkles, Eye, EyeOff, Gift } from "lucide-react";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== confirmPw) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form);
      const loginRes = await authAPI.login({ name: form.name, password: form.password });
      login(loginRes.data);
      navigate("/booking");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", icon: User, type: "text", label: "Full Name", placeholder: "Enter your full name", required: true },
    { key: "email", icon: Mail, type: "email", label: "Email", placeholder: "Enter your email", required: true },
    { key: "phone", icon: Phone, type: "tel", label: "Phone", placeholder: "Phone number (optional)", required: false },
  ];

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
          <img src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=1000" alt="Spa and Beauty" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, position: 'absolute', top: 0, left: 0 }} />
          <div className="auth-modern-orb auth-modern-orb-1" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3), transparent 60%)" }} />
          <div className="auth-modern-orb auth-modern-orb-2" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent 60%)" }} />
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
          <h2>Join SmartSalon Luxe</h2>
          <p>Create your exclusive account to unlock our AI-powered style consultations and premium beauty care.</p>
          <div className="auth-modern-features">
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}><Sparkles size={16} /></div>
              <div>
                <strong>AI Styling</strong>
                <span>Preview hairstyles with AI</span>
              </div>
            </div>
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Shield size={16} /></div>
              <div>
                <strong>Privacy Assured</strong>
                <span>Your beauty profile is 100% private</span>
              </div>
            </div>
            <div className="auth-modern-feature">
              <div className="auth-modern-feature-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><Gift size={16} /></div>
              <div>
                <strong>VIP Welcome</strong>
                <span>Complimentary 500 reward points</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-modern-right">
        <div className="auth-modern-form-container">
          <div className="auth-modern-form-header">
            <div className="auth-modern-form-badge">Get started free</div>
            <h1>Create Account</h1>
            <p>Fill in your details to join SmartSalon</p>
          </div>

          {error && <div className="auth-modern-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, icon: Icon, type, label, placeholder, required }) => (
              <div key={key} className={`auth-modern-field ${focused === key ? "focused" : ""} ${form[key] ? "filled" : ""}`}>
                <label>{label}</label>
                <div className="auth-modern-input-wrap">
                  <Icon size={18} className="auth-modern-input-icon" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                    required={required}
                  />
                </div>
              </div>
            ))}

            <div className={`auth-modern-field ${focused === "password" ? "focused" : ""} ${form.password ? "filled" : ""}`}>
              <label>Password</label>
              <div className="auth-modern-input-wrap">
                <Lock size={18} className="auth-modern-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  minLength={6}
                />
                <button type="button" className="auth-modern-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className={`auth-modern-field ${focused === "confirm" ? "focused" : ""} ${confirmPw ? "filled" : ""}`}>
              <label>Confirm Password</label>
              <div className="auth-modern-input-wrap">
                <Lock size={18} className="auth-modern-input-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                  required
                  minLength={6}
                />
                <button type="button" className="auth-modern-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-modern-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" style={{ width: "1.2rem", height: "1.2rem" }} />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-modern-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="auth-modern-alt-btn">
            Sign In Instead <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
