import React, { useState, useEffect } from "react";
import { bookingsAPI, servicesAPI, staffAPI } from "../services/api";
import {
  Calendar, Clock, Search, User, Scissors,
  RefreshCw, X, Check, AlertCircle, CheckCircle2, XCircle
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "#e65100", bg: "#fff3e0", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "#1565c0", bg: "#e3f2fd", label: "Confirmed" },
  completed: { icon: CheckCircle2, color: "#2e7d32", bg: "#e8f5e9", label: "Completed" },
  cancelled: { icon: XCircle, color: "#c62828", bg: "#fce4ec", label: "Cancelled" },
};

export default function AppointmentTracker() {
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [bRes, sRes, stRes] = await Promise.all([
        bookingsAPI.myBookings(),
        servicesAPI.list(),
        staffAPI.list(),
      ]);
      setBookings(bRes.data);
      setServices(sRes.data);
      setStaff(stRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (id) => services.find((s) => s.id === id)?.name || `Service #${id}`;
  const getStaffName = (id) => staff.find((s) => s.id === id)?.name || `Staff #${id}`;

  const filtered = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (dateFilter) {
      const bDate = new Date(b.appointment_date).toISOString().split("T")[0];
      if (bDate !== dateFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const svcName = (b.service?.name || getServiceName(b.service_id)).toLowerCase();
      const stfName = (b.staff?.name || getStaffName(b.staff_id)).toLowerCase();
      if (!svcName.includes(q) && !stfName.includes(q) && !`#${b.id}`.includes(q)) return false;
    }
    return true;
  });

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await bookingsAPI.cancel(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel");
    }
  };

  const reschedule = async (id) => {
    if (!newDate || !newTime) { alert("Select date and time"); return; }
    try {
      await bookingsAPI.reschedule(id, { appointment_date: `${newDate}T${newTime}:00` });
      setRescheduleId(null);
      setNewDate("");
      setNewTime("");
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to reschedule");
    }
  };

  const upcoming = filtered.filter((b) => ["pending", "confirmed"].includes(b.status));
  const past = filtered.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="up-page">
      <div className="up-page-header">
        <div className="up-page-header-icon"><Calendar size={24} /></div>
        <div>
          <h1>Appointment Tracker</h1>
          <p>Track and manage all your appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="up-tracker-filters">
        <div className="up-tracker-search">
          <Search size={18} />
          <input type="text" placeholder="Search by service, staff, or booking ID..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="up-tracker-filter-group">
          <select className="up-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input className="up-input" type="date" value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)} style={{ maxWidth: 180 }} />
          <button className="up-btn up-btn-outline up-btn-sm"
            onClick={() => { setSearch(""); setStatusFilter(""); setDateFilter(""); }}>
            <RefreshCw size={14} /> Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="up-loading"><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="up-empty-state">
          <div className="up-empty-icon"><Calendar size={48} /></div>
          <h3>No appointments found</h3>
          <p>Book a service to see your appointments here</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="up-tracker-section">
              <h2 className="up-section-title">Upcoming ({upcoming.length})</h2>
              <div className="up-bookings-list">
                {upcoming.map((b) => {
                  const date = new Date(b.appointment_date);
                  const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div key={b.id} className="up-booking-card">
                      <div className="up-booking-date">
                        <span className="up-booking-day">{date.getDate()}</span>
                        <span className="up-booking-month">{date.toLocaleString("default", { month: "short" })}</span>
                        <span className="up-booking-time">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="up-booking-content">
                        <div className="up-booking-top">
                          <div className="up-booking-info">
                            <h3><Scissors size={15} /> {b.service?.name || getServiceName(b.service_id)}</h3>
                            <div className="up-booking-meta">
                              <span><User size={13} /> {b.staff?.name || getStaffName(b.staff_id)}</span>
                              {b.queue_position && <span><Clock size={13} /> Queue #{b.queue_position}</span>}
                              <span>Booking #{b.id}</span>
                            </div>
                          </div>
                          <div className="up-booking-status" style={{ background: status.bg, color: status.color }}>
                            <StatusIcon size={14} /> {status.label}
                          </div>
                        </div>
                        {b.notes && <p className="up-booking-notes" style={{ marginTop: "0.5rem" }}>{b.notes}</p>}

                        {rescheduleId === b.id ? (
                          <div className="up-inline-form" style={{ marginTop: "0.75rem" }}>
                            <input className="up-input" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ maxWidth: 160 }} />
                            <input className="up-input" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} style={{ maxWidth: 130 }} />
                            <button className="up-btn up-btn-primary up-btn-sm" onClick={() => reschedule(b.id)}>
                              <Check size={14} /> Confirm
                            </button>
                            <button className="up-btn up-btn-ghost up-btn-sm" onClick={() => setRescheduleId(null)}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="up-booking-actions">
                            <button className="up-btn up-btn-outline up-btn-sm" onClick={() => setRescheduleId(b.id)}>
                              <RefreshCw size={14} /> Reschedule
                            </button>
                            <button className="up-btn up-btn-danger up-btn-sm" onClick={() => cancelBooking(b.id)}>
                              <X size={14} /> Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="up-tracker-section">
              <h2 className="up-section-title">Past ({past.length})</h2>
              <div className="up-bookings-list">
                {past.map((b) => {
                  const date = new Date(b.appointment_date);
                  const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div key={b.id} className="up-booking-card" style={{ opacity: 0.75 }}>
                      <div className="up-booking-date">
                        <span className="up-booking-day">{date.getDate()}</span>
                        <span className="up-booking-month">{date.toLocaleString("default", { month: "short" })}</span>
                      </div>
                      <div className="up-booking-content">
                        <div className="up-booking-top">
                          <div className="up-booking-info">
                            <h3>{b.service?.name || getServiceName(b.service_id)}</h3>
                            <div className="up-booking-meta">
                              <span><User size={13} /> {b.staff?.name || getStaffName(b.staff_id)}</span>
                              <span>Booking #{b.id}</span>
                            </div>
                          </div>
                          <div className="up-booking-status" style={{ background: status.bg, color: status.color }}>
                            <StatusIcon size={14} /> {status.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
