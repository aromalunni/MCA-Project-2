import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import {
  Scissors, Calendar, ShoppingBag, MapPin, Wand2, User,
  Menu, X, LogOut, LayoutDashboard, ClipboardList, ShoppingCart,
  ChevronDown, Sparkles
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path ? "active" : "";

  const mainLinks = user ? [
    { path: "/booking", label: "Book", icon: Scissors },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/store", label: "Store", icon: ShoppingBag },
    { path: "/salons", label: "Salons", icon: MapPin },
    { path: "/face-analysis", label: "Beauty AI", icon: Wand2 },
  ] : [];

  return (
    <nav className={`modern-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="modern-nav-inner">
        {/* Brand */}
        <Link to="/" className="modern-nav-brand">
          <div className="modern-nav-brand-icon">
            <Scissors size={18} />
          </div>
          <span>SmartSalon</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`modern-nav-links ${mobileOpen ? "mobile-open" : ""}`}>
          {user ? (
            <>
              {mainLinks.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} className={`modern-nav-link ${isActive(path)}`}
                  onClick={() => setMobileOpen(false)}>
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
              {user.is_admin && (
                <Link to="/admin" className={`modern-nav-link ${isActive("/admin")}`}
                  onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} />
                  <span>Admin</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className={`modern-nav-link ${isActive("/login")}`}>Login</Link>
              <Link to="/register" className="modern-nav-cta">
                <Sparkles size={14} /> Get Started
              </Link>
            </>
          )}
        </div>

        {/* Right Section */}
        {user && (
          <div className="modern-nav-right">
            <Link to="/orders" className={`modern-nav-icon-btn ${isActive("/orders")}`} title="Orders">
              <ClipboardList size={18} />
            </Link>
            <Link to="/cart" className={`modern-nav-icon-btn ${isActive("/cart")}`} title="Cart">
              <ShoppingCart size={18} />
            </Link>
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="modern-nav-profile" onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}>
              <div className="modern-nav-avatar">
                {(user.name?.[0] || "U").toUpperCase()}
              </div>
              <ChevronDown size={14} className={`modern-nav-chevron ${profileOpen ? "open" : ""}`} />

              {profileOpen && (
                <div className="modern-nav-dropdown">
                  <div className="modern-nav-dropdown-header">
                    <div className="modern-nav-dropdown-avatar">
                      {(user.name?.[0] || "U").toUpperCase()}
                    </div>
                    <div>
                      <strong>{user.name || "User"}</strong>
                      <span>{user.email || (user.is_admin ? "Administrator" : "Customer")}</span>
                    </div>
                  </div>
                  <div className="modern-nav-dropdown-divider" />
                  <Link to="/profile" className="modern-nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/my-bookings" className="modern-nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Calendar size={16} /> My Bookings
                  </Link>
                  <Link to="/orders" className="modern-nav-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <ClipboardList size={16} /> My Orders
                  </Link>
                  <div className="modern-nav-dropdown-divider" />
                  <button className="modern-nav-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="modern-nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
