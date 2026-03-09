import React, { useEffect, useState } from "react";
import { bookingsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Users, Clock, Activity, Calendar } from "lucide-react";

const CROWD_CONFIG = {
  low: { label: "Low", color: "#10b981", bg: "#ecfdf5" },
  medium: { label: "Medium", color: "#f59e0b", bg: "#fffbeb" },
  high: { label: "High", color: "#ef4444", bg: "#fef2f2" },
};

export default function QueueStatus() {
  const { wsEvents } = useAuth();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await bookingsAPI.myQueue();
      setQueue(res.data);
    } catch {
      setQueue(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  useEffect(() => {
    const latest = wsEvents[wsEvents.length - 1];
    if (latest?.event === "slot_blocked" || latest?.event === "slot_freed") fetchQueue();
  }, [wsEvents]);

  if (loading) return <div className="spinner" style={{ margin: "1rem auto" }} />;
  if (!queue || !queue.queue_position) {
    return (
      <div className="up-queue-empty">
        <Clock size={16} /> No upcoming bookings
      </div>
    );
  }

  const crowd = CROWD_CONFIG[queue.crowd_level] || CROWD_CONFIG.low;

  return (
    <div className="up-queue-modern-card" style={{ background: "linear-gradient(135deg, white, #fafafa)", borderRadius: 20, padding: "1.5rem", border: "1px solid rgba(108,71,255,0.15)", boxShadow: "0 10px 40px rgba(108,71,255,0.08)", display: "flex", gap: "2rem", alignItems: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 6, height: "100%", background: crowd.color, opacity: 0.8 }} />
      <div style={{ position: "absolute", right: -40, top: -40, width: 120, height: 120, background: crowd.bg, borderRadius: "50%", opacity: 0.5, filter: "blur(20px)" }} />
      
      <div className="up-queue-modern-left" style={{ textAlign: "center", paddingRight: "2rem", borderRight: "1px solid var(--border-light)" }}>
        <p style={{ margin: 0, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", fontWeight: 600 }}>Queue Position</p>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 2, margin: "0.5rem 0" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>#</span>
          <span style={{ fontSize: "4rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{queue.queue_position}</span>
        </div>
        <span style={{ fontSize: "0.85rem", padding: "4px 12px", borderRadius: 20, background: crowd.bg, color: crowd.color, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}><Activity size={14} /> Crowd: {crowd.label}</span>
      </div>

      <div className="up-queue-modern-right" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: "1rem", borderRadius: 16, border: "1px solid var(--border-light)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(108,71,255,0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={20} /></div>
          <div>
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{queue.people_ahead}</p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>People Ahead</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: "1rem", borderRadius: 16, border: "1px solid var(--border-light)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(245,158,11,0.1)", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={20} /></div>
          <div>
            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>~{queue.estimated_wait_minutes} min</p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Estimated Wait</p>
          </div>
        </div>

        {queue.appointment_date && (
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 1rem", background: "#f8faff", borderRadius: 12, color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem" }}>
            <Calendar size={16} /> 
            <span>{new Date(queue.appointment_date).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
