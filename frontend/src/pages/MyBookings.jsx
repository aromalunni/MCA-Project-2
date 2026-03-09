import React, { useState, useEffect } from "react";
import { bookingsAPI, reviewsAPI } from "../services/api";
import {
  Calendar, Scissors, Clock, User, Star, X, RefreshCw,
  CheckCircle2, AlertCircle, XCircle, ClipboardList, ChevronDown
} from "lucide-react";

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5", label: "Confirmed" },
  pending: { icon: Clock, color: "#3b82f6", bg: "#eff6ff", label: "Pending" },
  cancelled: { icon: XCircle, color: "#ef4444", bg: "#fef2f2", label: "Cancelled" },
  completed: { icon: Star, color: "#f59e0b", bg: "#fffbeb", label: "Completed" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ bookingId: null, rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.myBookings();
      setBookings(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? Cancellation policy will apply.")) return;
    try {
      await bookingsAPI.cancel(id);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to cancel");
    }
  };

  const handleReschedule = async (id) => {
    if (!newDate) return;
    try {
      await bookingsAPI.reschedule(id, { appointment_date: new Date(newDate).toISOString() });
      setRescheduleId(null);
      setNewDate("");
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.detail || "Reschedule failed");
    }
  };

  const handleReview = async () => {
    if (!reviewForm.bookingId) return;
    try {
      await reviewsAPI.create({
        booking_id: reviewForm.bookingId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewMsg("Review submitted! Thank you.");
      setReviewForm({ bookingId: null, rating: 5, comment: "" });
      fetchBookings();
    } catch (err) {
      setReviewMsg(err.response?.data?.detail || "Failed to submit review");
    }
  };

  if (loading) return <div className="up-page"><div className="up-loading"><div className="spinner" /></div></div>;

  return (
    <div className="up-page">
      <div className="up-page-header">
        <div className="up-page-header-icon"><ClipboardList size={24} /></div>
        <div>
          <h1>My Bookings</h1>
          <p>{bookings.length} booking{bookings.length !== 1 ? "s" : ""} total</p>
        </div>
      </div>

      {error && <div className="up-alert up-alert-error"><AlertCircle size={16} /> {error}</div>}
      {reviewMsg && <div className="up-alert up-alert-success"><CheckCircle2 size={16} /> {reviewMsg}</div>}

      {bookings.length === 0 ? (
        <div className="up-empty-state">
          <div className="up-empty-icon"><Calendar size={48} /></div>
          <h3>No bookings yet</h3>
          <p>Book your first appointment and start your beauty journey</p>
          <a href="/booking" className="up-btn up-btn-primary">
            <Scissors size={16} /> Book Now
          </a>
        </div>
      ) : (
        <div className="up-bookings-list">
          {bookings.map((b) => {
            const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;
            const date = new Date(b.appointment_date);
            const isExpanded = expandedId === b.id;

            return (
              <div key={b.id} className={`up-booking-card ${b.status}`} style={{ display: "flex", overflow: "hidden", padding: 0, border: "1px solid var(--border-light)", background: "white", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
                {/* Image Sidebar (New) */}
                <div style={{ width: 140, position: "relative", flexShrink: 0 }}>
                  <img src={`https://images.unsplash.com/photo-${b.id % 2 === 0 ? "1560066984-138dadb4c035" : "1521590832167-7a15963658ce"}?auto=format&fit=crop&q=80&w=300`} 
                    alt="Service" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))" }} />
                  <div className="up-booking-date" style={{ position: "absolute", bottom: 15, left: 15, color: "white", border: "none", background: "none", padding: 0, alignItems: "flex-start" }}>
                    <span className="up-booking-day" style={{ color: "white", fontSize: "1.8rem", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{date.getDate()}</span>
                    <span className="up-booking-month" style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{date.toLocaleString("default", { month: "short" })}</span>
                    <span className="up-booking-time" style={{ color: "rgba(255,255,255,0.8)" }}>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="up-booking-content" style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div className="up-booking-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div className="up-booking-info">
                      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700 }}>{b.service?.name || `Service #${b.service_id}`}</h3>
                      <div className="up-booking-meta" style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><User size={13} /> {b.staff?.name || `Staff #${b.staff_id}`}</span>
                        {b.queue_position && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> Queue #{b.queue_position}</span>}
                        {b.package_id && <span className="up-tag" style={{ padding: "2px 8px", background: "rgba(108,71,255,0.1)", color: "var(--primary)", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>Package</span>}
                      </div>
                    </div>
                    <div className="up-booking-status" style={{ background: status.bg, color: status.color, padding: "6px 12px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                      <StatusIcon size={14} /> {status.label}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {(b.notes || b.cancellation_reason || b.refund_amount > 0) && (
                    <button onClick={() => setExpandedId(isExpanded ? null : b.id)} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, width: "fit-content", padding: 0, margin: "0.5rem 0" }}>
                      Details <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                    </button>
                  )}

                  {isExpanded && (
                    <div className="up-booking-details">
                      {b.notes && <p className="up-booking-notes">{b.notes}</p>}
                      {b.cancellation_reason && (
                        <p className="up-booking-cancel-reason"><XCircle size={13} /> {b.cancellation_reason}</p>
                      )}
                      {b.refund_amount != null && b.refund_amount > 0 && (
                        <p className="up-booking-refund"><CheckCircle2 size={13} /> Refund: Rs.{b.refund_amount.toFixed(0)}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="up-booking-actions">
                    {b.status === "confirmed" && (
                      <>
                        <button className="up-btn up-btn-outline up-btn-sm"
                          onClick={() => setRescheduleId(rescheduleId === b.id ? null : b.id)}>
                          <RefreshCw size={14} /> Reschedule
                        </button>
                        <button className="up-btn up-btn-danger up-btn-sm" onClick={() => handleCancel(b.id)}>
                          <X size={14} /> Cancel
                        </button>
                      </>
                    )}
                    {b.status === "completed" && (
                      <button className="up-btn up-btn-outline up-btn-sm"
                        onClick={() => setReviewForm({ bookingId: b.id, rating: 5, comment: "" })}>
                        <Star size={14} /> Write Review
                      </button>
                    )}
                  </div>

                  {/* Reschedule form */}
                  {rescheduleId === b.id && (
                    <div className="up-inline-form">
                      <div className="up-form-group" style={{ margin: 0 }}>
                        <label>New Date & Time</label>
                        <input className="up-input" type="datetime-local" value={newDate}
                          onChange={(e) => setNewDate(e.target.value)} style={{ maxWidth: 240 }} />
                      </div>
                      <button className="up-btn up-btn-primary up-btn-sm" onClick={() => handleReschedule(b.id)}>Confirm</button>
                      <button className="up-btn up-btn-ghost up-btn-sm" onClick={() => setRescheduleId(null)}>Cancel</button>
                    </div>
                  )}

                  {/* Review form */}
                  {reviewForm.bookingId === b.id && (
                    <div className="up-inline-form up-review-form">
                      <h4>Rate Your Experience</h4>
                      <div className="up-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`up-star-btn ${star <= reviewForm.rating ? "active" : ""}`}>
                            <Star size={22} fill={star <= reviewForm.rating ? "#f59e0b" : "none"} />
                          </button>
                        ))}
                      </div>
                      <textarea className="up-input" rows={2} placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                      <div className="up-btn-group">
                        <button className="up-btn up-btn-primary up-btn-sm" onClick={handleReview}>Submit</button>
                        <button className="up-btn up-btn-ghost up-btn-sm"
                          onClick={() => setReviewForm({ bookingId: null, rating: 5, comment: "" })}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
