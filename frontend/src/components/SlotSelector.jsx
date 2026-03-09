import React, { useEffect, useState, useCallback } from "react";
import { staffAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Clock } from "lucide-react";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function SlotSelector({ staffId, serviceId, date, onSelect, selected, onSlotsLoaded }) {
  const { wsEvents } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState(new Set());

  const fetchSlots = useCallback(async () => {
    if (!staffId || !serviceId || !date) return;
    setLoading(true);
    try {
      const res = await staffAPI.getSlots(staffId, date, serviceId);
      setSlots(res.data);
      const booked = new Set(res.data.filter((s) => !s.is_available).map((s) => s.datetime));
      setBlockedSlots(booked);
      if (onSlotsLoaded) onSlotsLoaded(res.data);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [staffId, serviceId, date]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  useEffect(() => {
    const latest = wsEvents[wsEvents.length - 1];
    if (!latest) return;
    if (latest.event === "slot_blocked" && latest.staff_id === staffId) {
      setBlockedSlots((prev) => new Set([...prev, latest.datetime]));
      if (selected === latest.datetime) onSelect(null);
    }
    if (latest.event === "slot_freed" && latest.staff_id === staffId) {
      setBlockedSlots((prev) => { const next = new Set(prev); next.delete(latest.datetime); return next; });
    }
  }, [wsEvents, staffId, selected, onSelect]);

  if (!staffId || !serviceId || !date) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Select a service, staff, and date first.</p>;
  }

  if (loading) return <div className="spinner" style={{ margin: "1rem auto" }} />;
  if (slots.length === 0) return <p style={{ color: "var(--text-muted)" }}>No slots available for this day.</p>;

  const available = slots.filter((s) => !blockedSlots.has(s.datetime)).length;

  return (
    <div>
      <p className="up-slots-count">
        <Clock size={14} /> {available} of {slots.length} slots available
      </p>
      <div className="up-slots-grid">
        {slots.map((slot) => {
          const isBlocked = blockedSlots.has(slot.datetime);
          const isSelected = selected === slot.datetime;
          return (
            <button key={slot.datetime}
              className={`up-slot-btn ${isSelected ? "selected" : ""}`}
              disabled={isBlocked}
              onClick={() => onSelect(isSelected ? null : slot.datetime)}>
              {formatTime(slot.datetime)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
