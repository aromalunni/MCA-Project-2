import React, { useState, useEffect, useRef } from "react";
import { notificationsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Bell, Check, Calendar, Star, Tag, Store, Info } from "lucide-react";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}



function getNotifTheme(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("book")) return { Icon: Calendar, color: "#6c47ff", bg: "rgba(108,71,255,0.1)" };
  if (t.includes("point") || t.includes("loyal")) return { Icon: Star, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
  if (t.includes("order") || t.includes("product")) return { Icon: Store, color: "#10b981", bg: "rgba(16,185,129,0.1)" };
  if (t.includes("offer") || t.includes("discount")) return { Icon: Tag, color: "#ec4899", bg: "rgba(236,72,153,0.1)" };
  return { Icon: Info, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" };
}

export default function NotificationBell() {
  const { wsEvents } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationsAPI.list(),
        notificationsAPI.unreadCount(),
      ]);
      setNotifications(notifRes.data);
      setUnreadCount(countRes.data.count);
    } catch {}
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    const latest = wsEvents[wsEvents.length - 1];
    if (latest?.event === "notification") {
      setNotifications((prev) => [
        { ...latest.data, is_read: false, created_at: new Date().toISOString() },
        ...prev,
      ]);
      setUnreadCount((c) => c + 1);
    }
  }, [wsEvents]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="up-notif-wrapper" ref={dropdownRef}>
      <button className="modern-nav-icon-btn" onClick={() => setOpen((o) => !o)} title="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="up-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="up-notif-dropdown">
          <div className="up-notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="up-notif-mark-all" onClick={handleMarkAllRead}>
                <Check size={13} /> Mark all read
              </button>
            )}
          </div>

          <div className="up-notif-list">
            {notifications.length === 0 ? (
              <div className="up-notif-empty">
                <div style={{ width: 50, height: 50, background: "rgba(108,71,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "var(--primary)" }}>
                  <Bell size={24} />
                </div>
                <h3>All caught up!</h3>
                <p>No new notifications right now.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const { Icon, color, bg } = getNotifTheme(n.title);
                return (
                  <div key={n.id}
                    className={`up-notif-item ${!n.is_read ? "unread" : ""}`}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}>
                    <div className="up-notif-icon-box" style={{ background: bg, color }}>
                      <Icon size={16} />
                    </div>
                    <div className="up-notif-content">
                      <div className="up-notif-title">{n.title}</div>
                      <div className="up-notif-msg">{n.message}</div>
                      <div className="up-notif-time">{timeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && <div className="up-notif-dot-modern" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
