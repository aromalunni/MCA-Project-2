import React, { useState, useEffect } from "react";
import { locationsAPI } from "../services/api";
import {
  MapPin, Phone, Clock, Star, Search, Navigation,
  ChevronRight, Building2
} from "lucide-react";

const KERALA_DISTRICTS = [
  "All Districts", "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
  "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

export default function SalonFinder() {
  const [locations, setLocations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadLocations(); }, []);

  const loadLocations = async () => {
    try {
      const res = await locationsAPI.list();
      setLocations(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = locations;
    if (district !== "All Districts") result = result.filter((l) => l.district === district);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, district, locations]);

  return (
    <div className="up-page">
      <div className="up-page-header" style={{ justifyContent: "space-between", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "rgba(108,71,255,0.1)", color: "var(--primary)", padding: 12, borderRadius: 16 }}>
            <MapPin size={28} />
          </div>
          <div>
            <h1 style={{ marginBottom: 4 }}>Salon Finder</h1>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Find SmartSalon branches across Kerala</p>
          </div>
        </div>
        <div className="up-finder-stats" style={{ display: "flex", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border-light)", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <Building2 size={16} color="var(--primary)" /> <span>{locations.length} Branches</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", padding: "8px 16px", borderRadius: 20, border: "1px solid var(--border-light)", fontWeight: 600, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
            <Star size={16} fill="#f59e0b" stroke="#f59e0b" /> <span>4.5+ Avg Rating</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="up-finder-controls">
        <div className="up-tracker-search">
          <Search size={18} />
          <input type="text" placeholder="Search by name, city, or area..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="up-select" value={district} onChange={(e) => setDistrict(e.target.value)}
          style={{ minWidth: 180 }}>
          {KERALA_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="up-loading"><span className="spinner" /></div>
      ) : (
        <div className="up-finder-layout-modern">
          {/* Main Map Area (Floating Glassmorphism) */}
          <div className="up-finder-map-modern" style={{ position: "relative", height: "calc(100vh - 280px)", minHeight: 500, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(108,71,255,0.1)", boxShadow: "0 10px 40px rgba(0,0,0,0.08)", background: "white" }}>
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map Route Background" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.15 }} />
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))", backdropFilter: "blur(2px)" }} />
            
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "var(--primary)", color: "white", padding: 16, borderRadius: "50%", marginBottom: "1rem", boxShadow: "0 8px 24px rgba(108,71,255,0.4)" }}>
                <Navigation size={40} />
              </div>
              <h3 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 0.5rem", textAlign: "center", background: "linear-gradient(to right, #6c47ff, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Kerala Salon Network</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", marginBottom: "2rem", textAlign: "center" }}>Select a branch from the list to view exact details</p>

              {selected && (
                <div style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", padding: "1.5rem", borderRadius: 20, border: "1px solid rgba(108,71,255,0.2)", width: "100%", maxWidth: 360, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", animation: "fadeInUp 0.4s ease forwards" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(108,71,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}><MapPin size={24} /></div>
                    <div>
                      <strong style={{ display: "block", fontSize: "1.1rem" }}>{selected.name}</strong>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{selected.city}, Kerala</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{selected.address}</p>
                  {selected.latitude && selected.longitude && (
                    <a href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                      target="_blank" rel="noopener noreferrer" 
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", width: "100%", background: "black", color: "white", borderRadius: 12, textDecoration: "none", fontWeight: 600, transition: "0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                      <Navigation size={16} /> Get Directions
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Location Cards Sidebar */}
          <div className="up-finder-locations-modern" style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "calc(100vh - 280px)", overflowY: "auto", paddingRight: 4 }}>
            {filtered.length === 0 ? (
              <div className="up-empty-state up-empty-sm" style={{ background: "white", borderRadius: 20 }}>
                <MapPin size={40} />
                <h3>No salons found</h3>
                <p>Try a different district or search term</p>
              </div>
            ) : (
              filtered.map((loc) => {
                const isSelected = selected?.id === loc.id;
                return (
                  <div key={loc.id}
                    onClick={() => setSelected(loc)}
                    style={{ background: isSelected ? "var(--surface-hover)" : "white", padding: "1.25rem", borderRadius: 16, border: `2px solid ${isSelected ? "var(--primary)" : "var(--border-light)"}`, cursor: "pointer", transition: "all 0.2s", boxShadow: isSelected ? "0 8px 24px rgba(108,71,255,0.15)" : "0 4px 12px rgba(0,0,0,0.02)", position: "relative", overflow: "hidden" }}>
                    
                    {isSelected && <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: "rgba(108,71,255,0.05)", borderRadius: "0 0 0 100%" }} />}
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", width: "80%" }}>{loc.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fffbeb", color: "#f59e0b", padding: "2px 6px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700 }}>
                        <Star size={12} fill="#f59e0b" /> {loc.rating?.toFixed(1) || "4.5"}
                      </div>
                    </div>
                    
                    <p style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.4 }}>
                      <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} /> 
                      <span>{loc.address}, {loc.city}</span>
                    </p>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      {loc.phone && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={13} /> {loc.phone}</span>}
                      {loc.opening_time && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={13} /> {loc.opening_time} - {loc.closing_time}</span>}
                    </div>
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
