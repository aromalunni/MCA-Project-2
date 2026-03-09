import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { authAPI, loyaltyAPI, reviewsAPI, waitlistAPI } from "../services/api";
import {
  User, Lock, Trophy, Star, Clock, Mail, Phone, Shield,
  ChevronRight, Gift, Calendar, Edit3, CheckCircle2, AlertCircle, XCircle
} from "lucide-react";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "password", label: "Security", icon: Lock },
  { key: "loyalty", label: "Loyalty", icon: Trophy },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "waitlist", label: "Waitlist", icon: Clock },
];

export default function Profile() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [loyalty, setLoyalty] = useState(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [myWaitlist, setMyWaitlist] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loyaltyAPI.balance().then((r) => setLoyalty(r.data)).catch(() => {});
    loyaltyAPI.history().then((r) => setLoyaltyHistory(r.data)).catch(() => {});
    reviewsAPI.myReviews().then((r) => setMyReviews(r.data)).catch(() => {});
    waitlistAPI.myWaitlist().then((r) => setMyWaitlist(r.data)).catch(() => {});
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", { name: form.name || undefined, phone: form.phone || undefined });
      setMsg("Profile updated successfully");
    } catch (err) {
      setMsg(err.response?.data?.detail || "Update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg("");
    try {
      await authAPI.changePassword(pwForm);
      setPwMsg("Password changed successfully");
      setPwForm({ current_password: "", new_password: "" });
    } catch (err) {
      setPwMsg(err.response?.data?.detail || "Password change failed");
    }
  };

  const handleLeaveWaitlist = async (id) => {
    try {
      await waitlistAPI.leave(id);
      setMyWaitlist((prev) => prev.filter((w) => w.id !== id));
    } catch {
      alert("Failed to leave waitlist");
    }
  };

  return (
    <div className="up-page" style={{ maxWidth: 780 }}>
      {/* Profile Header Card */}
      <div className="up-profile-hero">
        <div className="up-profile-hero-bg" style={{ background: "linear-gradient(135deg, #6c47ff 0%, #ec4899 50%, #a855f7 100%)", position: "relative", overflow: "hidden" }}>
          <img
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200"
            alt="Salon background"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, mixBlendMode: "overlay" }}
          />
        </div>
        <div className="up-profile-hero-content">
          <div className="up-profile-avatar-lg" style={{ background: "linear-gradient(135deg, #6c47ff, #ec4899)", color: "white", fontSize: "2rem", letterSpacing: "-1px" }}>
            {(user?.name?.[0] || "U").toUpperCase()}
          </div>
          <div className="up-profile-hero-info">
            <h1>{user?.name || "User"}</h1>
            <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={14} /> {user?.is_admin ? "Administrator" : "Premium Customer"}
            </p>
            {user?.email && <span className="up-profile-email"><Mail size={13} /> {user.email}</span>}
          </div>
        </div>
        {loyalty && (
          <div className="up-profile-hero-stats">
            <div className="up-profile-stat">
              <Trophy size={16} />
              <div>
                <strong>{loyalty.points}</strong>
                <span>Loyalty Points</span>
              </div>
            </div>
            <div className="up-profile-stat">
              <Gift size={16} />
              <div>
                <strong>Rs.{loyalty.value}</strong>
                <span>Rewards Value</span>
              </div>
            </div>
            <div className="up-profile-stat">
              <Star size={16} />
              <div>
                <strong>{myReviews.length}</strong>
                <span>Reviews</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="up-tabs">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`up-tab ${activeTab === key ? "active" : ""}`}
            onClick={() => setActiveTab(key)}>
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="up-profile-split-card up-animate-in">
          <img className="up-profile-split-img" src="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=600" alt="Profile setup" />
          <div className="up-profile-split-content">
            <div className="up-card-header" style={{ marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(108,71,255,0.1)", color: "var(--primary)", padding: 8, borderRadius: 12 }}><Edit3 size={20} /></div>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Edit Profile</h3>
            </div>
            {msg && <div className={`up-alert ${msg.includes("success") ? "up-alert-success" : "up-alert-error"}`}>
              {msg.includes("success") ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {msg}
            </div>}
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="up-form-group">
                <label style={{ fontWeight: 600, color: "var(--text)" }}><User size={14} /> Display Name</label>
                <input className="up-input" type="text" placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ background: "#f8faff", border: "1.5px solid rgba(108,71,255,0.1)" }} />
              </div>
              <div className="up-form-group">
                <label style={{ fontWeight: 600, color: "var(--text)" }}><Phone size={14} /> Phone Number</label>
                <input className="up-input" type="tel" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ background: "#f8faff", border: "1.5px solid rgba(108,71,255,0.1)" }} />
              </div>
              <button type="submit" className="up-btn up-btn-primary" style={{ marginTop: "0.5rem", borderRadius: "12px", background: "linear-gradient(135deg, #6c47ff, #ec4899)" }}>
                <CheckCircle2 size={16} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password tab */}
      {activeTab === "password" && (
        <div className="up-profile-split-card up-animate-in">
          <img className="up-profile-split-img" src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=600" alt="Security" />
          <div className="up-profile-split-content">
            <div className="up-card-header" style={{ marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", padding: 8, borderRadius: 12 }}><Shield size={20} /></div>
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Account Security</h3>
            </div>
            {pwMsg && <div className={`up-alert ${pwMsg.includes("success") ? "up-alert-success" : "up-alert-error"}`}>
              {pwMsg.includes("success") ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {pwMsg}
            </div>}
            <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="up-form-group">
                <label style={{ fontWeight: 600, color: "var(--text)" }}><Lock size={14} /> Current Password</label>
                <input className="up-input" type="password" placeholder="Enter current password"
                  value={pwForm.current_password} required
                  onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                  style={{ background: "#f8faff", border: "1.5px solid rgba(108,71,255,0.1)" }} />
              </div>
              <div className="up-form-group">
                <label style={{ fontWeight: 600, color: "var(--text)" }}><Lock size={14} /> New Password</label>
                <input className="up-input" type="password" placeholder="Min 6 characters"
                  value={pwForm.new_password} required minLength={6}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                  style={{ background: "#f8faff", border: "1.5px solid rgba(108,71,255,0.1)" }} />
              </div>
              <button type="submit" className="up-btn up-btn-primary" style={{ marginTop: "0.5rem", borderRadius: "12px", background: "#10b981", boxShadow: "0 8px 16px rgba(16,185,129,0.25)" }}>
                <Shield size={16} /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Loyalty tab */}
      {activeTab === "loyalty" && (
        <div className="up-animate-in">
          {loyalty && (
            <div className="up-loyalty-hero" style={{ overflow: "hidden", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=1200" alt="Rewards" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.2, mixBlendMode: "overlay" }} />
              <div className="up-loyalty-hero-content" style={{ position: "relative", zIndex: 1 }}>
                <div style={{ background: "rgba(255,255,255,0.25)", padding: 12, borderRadius: "50%", marginBottom: "1rem", backdropFilter: "blur(10px)" }}>
                  <Trophy size={36} color="white" />
                </div>
                <div className="up-loyalty-hero-points">
                  <span className="up-loyalty-pts">{loyalty.points}</span>
                  <span className="up-loyalty-pts-label">Points</span>
                </div>
                <p style={{ fontSize: "1.1rem", fontWeight: 500, margin: "0.2rem 0" }}>Worth Rs.{loyalty.value} in discounts</p>
                <span className="up-loyalty-info" style={{ background: "rgba(0,0,0,0.15)", border: "none", color: "white" }}>Earn 10 pts per Rs.100 spent</span>
              </div>
            </div>
          )}
          <h3 className="up-section-title" style={{ marginTop: "1.5rem" }}>Points History</h3>
          {loyaltyHistory.length === 0 ? (
            <div className="up-empty-state up-empty-sm">
              <Trophy size={32} />
              <p>No transactions yet. Book an appointment to start earning!</p>
            </div>
          ) : (
            <div className="up-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="up-table">
                <thead>
                  <tr><th>Date</th><th>Description</th><th>Points</th></tr>
                </thead>
                <tbody>
                  {loyaltyHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.created_at).toLocaleDateString("en-IN")}</td>
                      <td>{tx.description}</td>
                      <td className={tx.points > 0 ? "up-text-success" : "up-text-danger"} style={{ fontWeight: 700 }}>
                        {tx.points > 0 ? "+" : ""}{tx.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="up-animate-in">
          <h3 className="up-section-title">My Reviews</h3>
          {myReviews.length === 0 ? (
            <div className="up-empty-state up-empty-sm">
              <Star size={32} />
              <p>No reviews yet. Complete a booking to leave a review.</p>
            </div>
          ) : (
            <div className="up-reviews-list">
              {myReviews.map((r) => (
                <div key={r.id} className="up-review-card">
                  <div className="up-review-top">
                    <div className="up-review-stars">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={16} fill={i < r.rating ? "#f59e0b" : "none"}
                          stroke={i < r.rating ? "#f59e0b" : "#d1d5db"} />
                      ))}
                    </div>
                    <span className="up-review-date">
                      {new Date(r.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  {r.comment && <p className="up-review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Waitlist tab */}
      {activeTab === "waitlist" && (
        <div className="up-animate-in">
          <h3 className="up-section-title">My Waitlist</h3>
          {myWaitlist.length === 0 ? (
            <div className="up-empty-state up-empty-sm">
              <Clock size={32} />
              <p>Not on any waitlists.</p>
            </div>
          ) : (
            <div className="up-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="up-table">
                <thead>
                  <tr><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {myWaitlist.map((w) => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 600 }}>{w.preferred_date}</td>
                      <td>
                        <span className={`up-status-badge ${w.status}`}>
                          {w.status === "waiting" ? <Clock size={12} /> : w.status === "notified" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {w.status}
                        </span>
                      </td>
                      <td>
                        {w.status === "waiting" && (
                          <button className="up-btn up-btn-danger up-btn-sm" onClick={() => handleLeaveWaitlist(w.id)}>
                            <XCircle size={14} /> Leave
                          </button>
                        )}
                        {w.status === "notified" && (
                          <a href="/booking" className="up-btn up-btn-primary up-btn-sm">
                            <Calendar size={14} /> Book Now
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
