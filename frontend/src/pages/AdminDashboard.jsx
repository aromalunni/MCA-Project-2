/**
 * AdminDashboard — Modern design with sidebar navigation and icons
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  analyticsAPI, bookingsAPI, servicesAPI, staffAPI, categoriesAPI,
  packagesAPI, locationsAPI, staffLeavesAPI, policiesAPI, paymentsAPI, discountsAPI,
  productsAPI, ordersAPI, attendanceAPI, payrollAPI,
} from "../services/api";
import { PeakHoursChart, ServicePopularityChart, DailyBookingsChart } from "../components/Charts";
import {
  LayoutDashboard, Calendar, Scissors, Users, UserCheck, Grid3X3, Package,
  MapPin, CalendarOff, FileText, Percent, ShoppingBag, ClipboardList,
  Clock, DollarSign, TrendingUp, Activity, UserPlus, BarChart3,
  Plus, Trash2, Check, X, ChevronRight, AlertCircle, Edit3,
  IndianRupee, CreditCard, Truck, Star, Search, Filter, LogOut,
  Smile, Droplets, Paintbrush, Sparkles, Sparkle
} from "lucide-react";

const CROWD_COLOR = { low: "var(--success)", medium: "var(--warning)", high: "var(--danger)" };

const TAB_CONFIG = [
  { key: "Overview", icon: LayoutDashboard, color: "#6c47ff" },
  { key: "Bookings", icon: Calendar, color: "#3b82f6" },
  { key: "Services", icon: Scissors, color: "#10b981" },
  { key: "Staff", icon: Users, color: "#f59e0b" },
  { key: "Users", icon: UserCheck, color: "#8b5cf6" },
  { key: "Categories", icon: Grid3X3, color: "#ec4899" },
  { key: "Packages", icon: Package, color: "#14b8a6" },
  { key: "Locations", icon: MapPin, color: "#ef4444" },
  { key: "Leaves", icon: CalendarOff, color: "#f97316" },
  { key: "Policies", icon: FileText, color: "#6366f1" },
  { key: "Discounts", icon: Percent, color: "#22c55e" },
  { key: "Products", icon: ShoppingBag, color: "#a855f7" },
  { key: "Orders", icon: ClipboardList, color: "#0ea5e9" },
  { key: "Attendance", icon: Clock, color: "#d946ef" },
  { key: "Payroll", icon: DollarSign, color: "#eab308" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState("Overview");
  const [summary, setSummary] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [policiesList, setPoliciesList] = useState([]);
  const [discountsList, setDiscountsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [prodCategories, setProdCategories] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Booking filters
  const [bookingFilterDate, setBookingFilterDate] = useState("");
  const [bookingFilterService, setBookingFilterService] = useState("");
  const [bookingFilterStatus, setBookingFilterStatus] = useState("");

  // Forms
  const [newService, setNewService] = useState({ name: "", description: "", duration_minutes: 30, price: 0, category_id: "", location_id: "" });
  const [newStaff, setNewStaff] = useState({ name: "", specialization: "", experience_years: 0, work_start: "09:00", work_end: "18:00", location_id: "" });
  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "" });
  const [newPackage, setNewPackage] = useState({ name: "", description: "", discount_percent: 0, service_ids: [] });
  const [newLocation, setNewLocation] = useState({ name: "", address: "", city: "", phone: "", opening_time: "09:00", closing_time: "21:00" });
  const [newLeave, setNewLeave] = useState({ staff_id: "", leave_date: "", leave_type: "personal", reason: "" });
  const [newPolicy, setNewPolicy] = useState({ name: "", hours_before: 24, refund_percent: 100, penalty_amount: 0 });
  const [newDiscount, setNewDiscount] = useState({ service_id: "", discount_type: "percentage", discount_value: 10, start_date: "", end_date: "" });
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: 0, discount_price: "", category_id: "", gender: "unisex", brand: "", stock: 0 });
  const [newAttendance, setNewAttendance] = useState({ staff_id: "", date: "", check_in: "09:00", check_out: "18:00", status: "present" });
  const [newPayroll, setNewPayroll] = useState({ staff_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), base_salary: 0, bonus: 0, deductions: 0 });
  const [formMsg, setFormMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sum, peak, pop, daily, disc] = await Promise.all([
          analyticsAPI.summary(), analyticsAPI.peakHours(),
          analyticsAPI.popularServices(), analyticsAPI.dailyBookings(),
          discountsAPI.list().catch(() => ({ data: [] })),
        ]);
        setSummary(sum.data); setPeakHours(peak.data);
        setPopularServices(pop.data); setDailyData(daily.data);
        setDiscountsList(disc.data);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    setFormMsg("");
    if (tab === "Bookings") { bookingsAPI.adminAll().then((r) => setBookings(r.data)); servicesAPI.listAll().then((r) => setServices(r.data)).catch(() => {}); }
    if (tab === "Services") { servicesAPI.listAll().then((r) => setServices(r.data)); categoriesAPI.listAll().then((r) => setCategories(r.data)).catch(() => {}); }
    if (tab === "Staff") { staffAPI.list().then((r) => setStaffList(r.data)); locationsAPI.list().then((r) => setLocationsList(r.data)).catch(() => {}); }
    if (tab === "Users") analyticsAPI.users().then((r) => setUsers(r.data));
    if (tab === "Categories") categoriesAPI.listAll().then((r) => setCategories(r.data)).catch(() => {});
    if (tab === "Packages") { packagesAPI.listAll().then((r) => setPackagesList(r.data)).catch(() => {}); servicesAPI.listAll().then((r) => setServices(r.data)); }
    if (tab === "Locations") locationsAPI.listAll().then((r) => setLocationsList(r.data)).catch(() => {});
    if (tab === "Leaves") { staffLeavesAPI.list().then((r) => setLeavesList(r.data)).catch(() => {}); staffAPI.list().then((r) => setStaffList(r.data)); }
    if (tab === "Policies") policiesAPI.list().then((r) => setPoliciesList(r.data)).catch(() => {});
    if (tab === "Discounts") { discountsAPI.listAll().then((r) => setDiscountsList(r.data)).catch(() => {}); servicesAPI.listAll().then((r) => setServices(r.data)).catch(() => {}); }
    if (tab === "Products") { productsAPI.listAll().then((r) => setProductsList(r.data)).catch(() => {}); productsAPI.categories().then((r) => setProdCategories(r.data)).catch(() => {}); }
    if (tab === "Orders") { ordersAPI.adminAll({}).then((r) => setOrdersList(r.data)).catch(() => {}); }
    if (tab === "Attendance") { attendanceAPI.list({}).then((r) => setAttendanceList(r.data)).catch(() => {}); staffAPI.list().then((r) => setStaffList(r.data)).catch(() => {}); }
    if (tab === "Payroll") { payrollAPI.list({}).then((r) => setPayrollList(r.data)).catch(() => {}); staffAPI.list().then((r) => setStaffList(r.data)).catch(() => {}); }
  }, [tab]);

  const handleStatusUpdate = async (id, status) => {
    await bookingsAPI.adminUpdateStatus(id, { status });
    bookingsAPI.adminAll().then((r) => setBookings(r.data));
  };

  const handleToggleUser = async (id) => {
    await analyticsAPI.toggleUserActive(id);
    analyticsAPI.users().then((r) => setUsers(r.data));
  };

  const handleCreateService = async () => {
    try {
      const data = { ...newService };
      if (!data.category_id) delete data.category_id; else data.category_id = +data.category_id;
      if (!data.location_id) delete data.location_id; else data.location_id = +data.location_id;
      await servicesAPI.create(data);
      setFormMsg("Service created"); setNewService({ name: "", description: "", duration_minutes: 30, price: 0, category_id: "", location_id: "" });
      servicesAPI.listAll().then((r) => setServices(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreateStaff = async () => {
    try {
      const data = { ...newStaff };
      if (!data.location_id) delete data.location_id; else data.location_id = +data.location_id;
      await staffAPI.create(data);
      setFormMsg("Staff added"); setNewStaff({ name: "", specialization: "", experience_years: 0, work_start: "09:00", work_end: "18:00", location_id: "" });
      staffAPI.list().then((r) => setStaffList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreateCategory = async () => {
    try {
      await categoriesAPI.create(newCategory);
      setFormMsg("Category created"); setNewCategory({ name: "", description: "", icon: "" });
      categoriesAPI.listAll().then((r) => setCategories(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreatePackage = async () => {
    try {
      await packagesAPI.create(newPackage);
      setFormMsg("Package created"); setNewPackage({ name: "", description: "", discount_percent: 0, service_ids: [] });
      packagesAPI.listAll().then((r) => setPackagesList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreateLocation = async () => {
    try {
      await locationsAPI.create(newLocation);
      setFormMsg("Location created"); setNewLocation({ name: "", address: "", city: "", phone: "", opening_time: "09:00", closing_time: "21:00" });
      locationsAPI.listAll().then((r) => setLocationsList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreateLeave = async () => {
    try {
      await staffLeavesAPI.create({ ...newLeave, staff_id: +newLeave.staff_id });
      setFormMsg("Leave created"); setNewLeave({ staff_id: "", leave_date: "", leave_type: "personal", reason: "" });
      staffLeavesAPI.list().then((r) => setLeavesList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleDeleteLeave = async (id) => {
    await staffLeavesAPI.delete(id);
    staffLeavesAPI.list().then((r) => setLeavesList(r.data));
  };

  const handleCreatePolicy = async () => {
    try {
      await policiesAPI.create(newPolicy);
      setFormMsg("Policy created"); setNewPolicy({ name: "", hours_before: 24, refund_percent: 100, penalty_amount: 0 });
      policiesAPI.list().then((r) => setPoliciesList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleCreateDiscount = async () => {
    try {
      const data = { ...newDiscount, service_id: +newDiscount.service_id, discount_value: +newDiscount.discount_value };
      await discountsAPI.create(data);
      setFormMsg("Discount created"); setNewDiscount({ service_id: "", discount_type: "percentage", discount_value: 10, start_date: "", end_date: "" });
      discountsAPI.listAll().then((r) => setDiscountsList(r.data));
    } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
  };

  const handleToggleDiscount = async (id, currentActive) => {
    await discountsAPI.update(id, { is_active: !currentActive });
    discountsAPI.listAll().then((r) => setDiscountsList(r.data));
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus && b.status !== bookingFilterStatus) return false;
    if (bookingFilterService && b.service_id !== +bookingFilterService) return false;
    if (bookingFilterDate) {
      const bDate = new Date(b.appointment_date).toISOString().split("T")[0];
      if (bDate !== bookingFilterDate) return false;
    }
    return true;
  });

  const toggleServiceInPackage = (svcId) => {
    setNewPackage((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(svcId)
        ? prev.service_ids.filter((id) => id !== svcId)
        : [...prev.service_ids, svcId],
    }));
  };

  const currentTab = TAB_CONFIG.find(t => t.key === tab);

  const getCatIcon = (name) => {
    const map = {
      "Hair": Scissors, "Hair Care": Scissors,
      "Beard & Grooming": Smile,
      "Skin Care": Sparkles,
      "Spa": Droplets, "Fragrances": Droplets,
      "Nails": Paintbrush, "Makeup": Paintbrush,
      "Bridal": Sparkle, "Tools & Accessories": Grid3X3
    };
    const IconComponent = map[name] || Grid3X3;
    return <IconComponent size={18} />;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="admin-sidebar-header">
          <LayoutDashboard size={22} />
          {sidebarOpen && <span>Admin Panel</span>}
        </div>
        <nav className="admin-sidebar-nav">
          {TAB_CONFIG.map(({ key, icon: Icon, color }) => (
            <button
              key={key}
              className={`admin-nav-item ${tab === key ? "active" : ""}`}
              onClick={() => setTab(key)}
              title={key}
            >
              <Icon size={18} style={{ color: tab === key ? color : undefined }} />
              {sidebarOpen && <span>{key}</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button
            className="admin-nav-item admin-logout-btn"
            onClick={() => { logout(); navigate("/login"); }}
            title="Logout"
          >
            <LogOut size={18} style={{ color: "#ef4444" }} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ChevronRight size={18} style={{ transform: sidebarOpen ? "rotate(180deg)" : "none", transition: "0.2s" }} />
            </button>
            <h1 className="admin-page-title">
              {currentTab && <currentTab.icon size={24} style={{ color: currentTab.color }} />}
              {tab}
            </h1>
          </div>
        </div>

        {formMsg && (
          <div className={`admin-alert ${formMsg.startsWith("Error") ? "error" : "success"}`}>
            {formMsg.startsWith("Error") ? <AlertCircle size={16} /> : <Check size={16} />}
            {formMsg}
            <button onClick={() => setFormMsg("")}><X size={14} /></button>
          </div>
        )}

        <div className="admin-content">
          {/* ── OVERVIEW ── */}
          {tab === "Overview" && (
            <>
              {loading && <div className="spinner" />}
              {summary && (
                <>
                  <div className="admin-stats-grid">
                    {/* Total Bookings */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#6c47ff", animationDelay: "0ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(108,71,255,0.12)", color: "#6c47ff" }}><Calendar size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Total Bookings</span>
                        <span className="admin-stat-value">{summary.total_bookings}</span>
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <TrendingUp size={11} /> All time
                        </span>
                      </div>
                    </div>
                    {/* Today */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#3b82f6", animationDelay: "80ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}><Clock size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Today's Bookings</span>
                        <span className="admin-stat-value">{summary.todays_bookings}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: 2 }}>Live count</span>
                      </div>
                    </div>
                    {/* Daily Revenue */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#10b981", animationDelay: "160ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}><TrendingUp size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Daily Revenue</span>
                        <span className="admin-stat-value">Rs.{summary.daily_revenue.toFixed(0)}</span>
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <TrendingUp size={11} /> Today
                        </span>
                      </div>
                    </div>
                    {/* Total Revenue */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#f59e0b", animationDelay: "240ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}><IndianRupee size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Total Revenue</span>
                        <span className="admin-stat-value">Rs.{summary.total_revenue.toFixed(0)}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: 2 }}>All time</span>
                      </div>
                    </div>
                    {/* Active Users */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#8b5cf6", animationDelay: "320ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}><UserCheck size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Active Users</span>
                        <span className="admin-stat-value">{summary.active_users}</span>
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <UserPlus size={11} /> Growing
                        </span>
                      </div>
                    </div>
                    {/* Crowd Level */}
                    <div className="admin-stat-card" style={{ borderLeftColor: CROWD_COLOR[summary.crowd_level], animationDelay: "400ms" }}>
                      <div className="admin-stat-icon" style={{ background: summary.crowd_level === "low" ? "rgba(16,185,129,0.12)" : summary.crowd_level === "medium" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)", color: CROWD_COLOR[summary.crowd_level] }}><Activity size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Crowd Level</span>
                        <span className="admin-stat-value" style={{ color: CROWD_COLOR[summary.crowd_level], fontSize: "1.4rem" }}>{summary.crowd_level.toUpperCase()}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: 2 }}>Current status</span>
                      </div>
                    </div>
                    {/* Active Discounts */}
                    <div className="admin-stat-card" style={{ borderLeftColor: "#ec4899", animationDelay: "480ms" }}>
                      <div className="admin-stat-icon" style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}><Percent size={22} /></div>
                      <div className="admin-stat-info">
                        <span className="admin-stat-label">Active Discounts</span>
                        <span className="admin-stat-value">{discountsList.length}</span>
                        <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600, marginTop: 2 }}>Running offers</span>
                      </div>
                    </div>
                  </div>
                  {/* Charts — full-width line + two side charts */}
                  <div style={{ marginBottom: "2rem" }}><DailyBookingsChart data={dailyData} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                    <ServicePopularityChart data={popularServices} />
                    <PeakHoursChart data={peakHours} />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "Bookings" && (
            <>
              <div className="admin-section-header">
                <h2><Calendar size={20} /> All Bookings ({filteredBookings.length})</h2>
              </div>
              <div className="admin-filters-bar">
                <div className="admin-filter-item">
                  <label><Calendar size={12} /> Date</label>
                  <input type="date" value={bookingFilterDate}
                    onChange={(e) => setBookingFilterDate(e.target.value)} />
                </div>
                <div className="admin-filter-item">
                  <label><Scissors size={12} /> Service</label>
                  <select value={bookingFilterService}
                    onChange={(e) => setBookingFilterService(e.target.value)}>
                    <option value="">All Services</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="admin-filter-item">
                  <label><Filter size={12} /> Status</label>
                  <select value={bookingFilterStatus}
                    onChange={(e) => setBookingFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {(bookingFilterDate || bookingFilterService || bookingFilterStatus) && (
                  <button className="btn btn-ghost btn-sm" onClick={() => { setBookingFilterDate(""); setBookingFilterService(""); setBookingFilterStatus(""); }}>
                    <X size={14} /> Clear
                  </button>
                )}
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Staff</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td><span className="admin-id">#{b.id}</span></td>
                        <td><span className="admin-user-badge"><UserCheck size={12} /> User #{b.user_id}</span></td>
                        <td>{b.service?.name}</td><td>{b.staff?.name}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{new Date(b.appointment_date).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</td>
                        <td><span className={`badge badge-${b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : b.status === "completed" ? "warning" : "info"}`}>{b.status}</span></td>
                        <td>
                          {b.status === "confirmed" && (
                            <div className="admin-action-btns">
                              <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(b.id, "completed")}><Check size={12} /> Complete</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleStatusUpdate(b.id, "cancelled")}><X size={12} /> Cancel</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SERVICES ── */}
          {tab === "Services" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add New Service</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  {[["Service Name", "text", "name"], ["Description", "text", "description"], ["Duration (min)", "number", "duration_minutes"], ["Price (Rs.)", "number", "price"]].map(([label, type, key]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type={type} value={newService[key]}
                        onChange={(e) => setNewService({ ...newService, [key]: type === "number" ? +e.target.value : e.target.value })} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={newService.category_id}
                      onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}>
                      <option value="">None</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <select className="form-control" value={newService.location_id}
                      onChange={(e) => setNewService({ ...newService, location_id: e.target.value })}>
                      <option value="">None</option>
                      {locationsList.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreateService}><Plus size={14} /> Add Service</button>
              </div>

              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Scissors size={20} /> All Services ({services.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Duration</th><th>Price</th><th>Category</th><th>Status</th></tr></thead>
                  <tbody>
                    {services.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.duration_minutes} min</td><td>Rs.{s.price}</td>
                        <td>{categories.find((c) => c.id === s.category_id)?.name || "—"}</td>
                        <td><span className={`badge ${s.is_active ? "badge-success" : "badge-danger"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── STAFF ── */}
          {tab === "Staff" && (
            <>
              <div className="admin-section-header">
                <h2><UserPlus size={20} /> Add Staff</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  {[["Name", "text", "name"], ["Specialization", "text", "specialization"], ["Experience (years)", "number", "experience_years"], ["Work Start", "time", "work_start"], ["Work End", "time", "work_end"]].map(([label, type, key]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type={type} value={newStaff[key]}
                        onChange={(e) => setNewStaff({ ...newStaff, [key]: type === "number" ? +e.target.value : e.target.value })} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Location</label>
                    <select className="form-control" value={newStaff.location_id}
                      onChange={(e) => setNewStaff({ ...newStaff, location_id: e.target.value })}>
                      <option value="">None</option>
                      {locationsList.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreateStaff}><UserPlus size={14} /> Add Staff</button>
              </div>

              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Users size={20} /> Staff Members ({staffList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Specialization</th><th>Experience</th><th>Hours</th><th>Location</th><th>Status</th></tr></thead>
                  <tbody>
                    {staffList.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.specialization}</td><td>{s.experience_years} yrs</td><td>{s.work_start} – {s.work_end}</td>
                        <td>{locationsList.find((l) => l.id === s.location_id)?.name || "—"}</td>
                        <td><span className={`badge ${s.is_available ? "badge-success" : "badge-danger"}`}>{s.is_available ? "Available" : "Unavailable"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === "Users" && (
            <>
              <div className="admin-section-header">
                <h2><UserCheck size={20} /> All Users ({users.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td><td>{u.email}</td>
                        <td><span className={`badge ${u.is_admin ? "badge-warning" : "badge-info"}`}>{u.is_admin ? "Admin" : "User"}</span></td>
                        <td><span className={`badge ${u.is_active ? "badge-success" : "badge-danger"}`}>{u.is_active ? "Active" : "Deactivated"}</span></td>
                        <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                        <td>{!u.is_admin && (
                          <button className={`btn btn-sm ${u.is_active ? "btn-danger" : "btn-primary"}`} onClick={() => handleToggleUser(u.id)}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        )}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── CATEGORIES ── */}
          {tab === "Categories" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add Category</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Name</label>
                    <input className="form-control" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Description</label>
                    <input className="form-control" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreateCategory}><Plus size={14} /> Add Category</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Grid3X3 size={20} /> All Categories ({categories.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Status</th></tr></thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id}>
                        <td>{getCatIcon(c.name)}</td><td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.description || "—"}</td>
                        <td><span className={`badge ${c.is_active ? "badge-success" : "badge-danger"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PACKAGES ── */}
          {tab === "Packages" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Create Package</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Package Name</label>
                    <input className="form-control" value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <input className="form-control" value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Discount %</label>
                    <input className="form-control" type="number" value={newPackage.discount_percent}
                      onChange={(e) => setNewPackage({ ...newPackage, discount_percent: +e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "0.5rem" }}>
                  <label>Select Services</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {services.filter((s) => s.is_active).map((s) => (
                      <button key={s.id}
                        className={`btn btn-sm ${newPackage.service_ids.includes(s.id) ? "btn-primary" : "btn-outline"}`}
                        onClick={() => toggleServiceInPackage(s.id)}>
                        {s.name} (Rs.{s.price})
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={handleCreatePackage}><Package size={14} /> Create Package</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Package size={20} /> All Packages ({packagesList.length})</h2>
              </div>
              <div className="admin-cards-list">
                {packagesList.map((pkg) => (
                  <div key={pkg.id} className="admin-package-card">
                    <div className="admin-package-info">
                      <h3><Package size={16} /> {pkg.name} {pkg.discount_percent > 0 && <span className="badge badge-success">{pkg.discount_percent}% OFF</span>}</h3>
                      {pkg.description && <p>{pkg.description}</p>}
                      <p className="admin-package-services">Services: {pkg.services.map((s) => s.name).join(", ") || "None"}</p>
                    </div>
                    <div className="admin-package-price">
                      <div className="admin-package-amount">Rs.{pkg.total_price.toFixed(0)}</div>
                      <div className="admin-package-duration">{pkg.total_duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── LOCATIONS ── */}
          {tab === "Locations" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add Location</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  {[["Branch Name", "text", "name"], ["Address", "text", "address"], ["City", "text", "city"], ["Phone", "tel", "phone"], ["Opening Time", "time", "opening_time"], ["Closing Time", "time", "closing_time"]].map(([label, type, key]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type={type} value={newLocation[key]}
                        onChange={(e) => setNewLocation({ ...newLocation, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={handleCreateLocation}><MapPin size={14} /> Add Location</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><MapPin size={20} /> All Locations ({locationsList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Address</th><th>City</th><th>Phone</th><th>Hours</th><th>Status</th></tr></thead>
                  <tbody>
                    {locationsList.map((l) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.name}</td><td>{l.address}</td><td>{l.city}</td><td>{l.phone || "—"}</td>
                        <td>{l.opening_time || "—"} – {l.closing_time || "—"}</td>
                        <td><span className={`badge ${l.is_active ? "badge-success" : "badge-danger"}`}>{l.is_active ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── LEAVES ── */}
          {tab === "Leaves" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add Staff Leave</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Staff Member</label>
                    <select className="form-control" value={newLeave.staff_id}
                      onChange={(e) => setNewLeave({ ...newLeave, staff_id: e.target.value })}>
                      <option value="">Select Staff</option>
                      {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Leave Date</label>
                    <input className="form-control" type="date" value={newLeave.leave_date}
                      onChange={(e) => setNewLeave({ ...newLeave, leave_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Leave Type</label>
                    <select className="form-control" value={newLeave.leave_type}
                      onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}>
                      <option value="personal">Personal</option>
                      <option value="vacation">Vacation</option>
                      <option value="sick">Sick</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Reason</label>
                    <input className="form-control" value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreateLeave}><CalendarOff size={14} /> Add Leave</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><CalendarOff size={20} /> All Staff Leaves ({leavesList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Staff</th><th>Date</th><th>Type</th><th>Reason</th><th>Actions</th></tr></thead>
                  <tbody>
                    {leavesList.map((l) => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{staffList.find((s) => s.id === l.staff_id)?.name || `#${l.staff_id}`}</td>
                        <td>{l.leave_date}</td>
                        <td><span className="badge badge-info">{l.leave_type}</span></td>
                        <td>{l.reason || "—"}</td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => handleDeleteLeave(l.id)}><Trash2 size={12} /> Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── POLICIES ── */}
          {tab === "Policies" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add Cancellation Policy</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Policy Name</label>
                    <input className="form-control" value={newPolicy.name} onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Hours Before Appointment</label>
                    <input className="form-control" type="number" value={newPolicy.hours_before}
                      onChange={(e) => setNewPolicy({ ...newPolicy, hours_before: +e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Refund Percent (%)</label>
                    <input className="form-control" type="number" value={newPolicy.refund_percent}
                      onChange={(e) => setNewPolicy({ ...newPolicy, refund_percent: +e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Penalty Amount (Rs.)</label>
                    <input className="form-control" type="number" value={newPolicy.penalty_amount}
                      onChange={(e) => setNewPolicy({ ...newPolicy, penalty_amount: +e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreatePolicy}><FileText size={14} /> Add Policy</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><FileText size={20} /> Active Policies ({policiesList.length})</h2>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                When a user cancels, the system picks the policy with the highest hours_before that is still less than the actual hours remaining.
              </p>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Hours Before</th><th>Refund %</th><th>Penalty</th></tr></thead>
                  <tbody>
                    {policiesList.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.hours_before}h</td>
                        <td>{p.refund_percent}%</td>
                        <td>Rs.{p.penalty_amount}</td>
                      </tr>
                    ))}
                    {policiesList.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)" }}>No policies. All cancellations get 100% refund by default.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PRODUCTS ── */}
          {tab === "Products" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Add Product</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  {[["Product Name", "text", "name"], ["Description", "text", "description"], ["Price (Rs.)", "number", "price"],
                    ["Discount Price", "number", "discount_price"], ["Brand", "text", "brand"], ["Stock", "number", "stock"]].map(([label, type, key]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type={type} value={newProduct[key]}
                        onChange={(e) => setNewProduct({ ...newProduct, [key]: type === "number" ? (e.target.value === "" ? "" : +e.target.value) : e.target.value })} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" value={newProduct.category_id}
                      onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}>
                      <option value="">None</option>
                      {prodCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select className="form-control" value={newProduct.gender}
                      onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}>
                      <option value="unisex">Unisex</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    const data = { ...newProduct };
                    if (data.category_id) data.category_id = +data.category_id; else delete data.category_id;
                    if (!data.discount_price) delete data.discount_price;
                    await productsAPI.create(data);
                    setFormMsg("Product created");
                    setNewProduct({ name: "", description: "", price: 0, discount_price: "", category_id: "", gender: "unisex", brand: "", stock: 0 });
                    productsAPI.listAll().then((r) => setProductsList(r.data));
                  } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
                }}><ShoppingBag size={14} /> Add Product</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><ShoppingBag size={20} /> All Products ({productsList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Brand</th><th>Price</th><th>Disc. Price</th><th>Gender</th><th>Stock</th><th>Status</th></tr></thead>
                  <tbody>
                    {productsList.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.brand || "—"}</td>
                        <td>Rs.{p.price}</td>
                        <td>{p.discount_price ? <span style={{ color: "var(--success)" }}>Rs.{p.discount_price}</span> : "—"}</td>
                        <td><span className="badge badge-info">{p.gender}</span></td>
                        <td><span className={p.stock < 5 ? "text-danger" : ""}>{p.stock}</span></td>
                        <td><span className={`badge ${p.is_active ? "badge-success" : "badge-danger"}`}>{p.is_active ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ORDERS ── */}
          {tab === "Orders" && (
            <>
              <div className="admin-section-header">
                <h2><ClipboardList size={20} /> All Store Orders ({ordersList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>ID</th><th>Tracking</th><th>Customer</th><th>Amount</th><th>Items</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {ordersList.map((o) => (
                      <tr key={o.id}>
                        <td><span className="admin-id">#{o.id}</span></td>
                        <td><code className="admin-tracking">{o.tracking_id}</code></td>
                        <td><span className="admin-user-badge"><UserCheck size={12} /> User #{o.user_id}</span></td>
                        <td style={{ fontWeight: 700, color: "var(--primary)" }}>Rs.{o.total_amount}</td>
                        <td>{o.items.length} items</td>
                        <td><span className="badge badge-info"><CreditCard size={10} /> {o.payment_method}</span></td>
                        <td><span className={`badge badge-${o.status === "delivered" ? "success" : o.status === "cancelled" ? "danger" : o.status === "shipped" ? "warning" : "info"}`}>{o.status}</span></td>
                        <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                        <td>
                          <select className="form-control admin-status-select"
                            value={o.status}
                            onChange={async (e) => {
                              await ordersAPI.adminUpdateStatus(o.id, e.target.value);
                              ordersAPI.adminAll({}).then((r) => setOrdersList(r.data));
                            }}>
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── ATTENDANCE ── */}
          {tab === "Attendance" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Mark Attendance</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Staff Member</label>
                    <select className="form-control" value={newAttendance.staff_id}
                      onChange={(e) => setNewAttendance({ ...newAttendance, staff_id: e.target.value })}>
                      <option value="">Select Staff</option>
                      {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input className="form-control" type="date" value={newAttendance.date}
                      onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Check In</label>
                    <input className="form-control" type="time" value={newAttendance.check_in}
                      onChange={(e) => setNewAttendance({ ...newAttendance, check_in: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Check Out</label>
                    <input className="form-control" type="time" value={newAttendance.check_out}
                      onChange={(e) => setNewAttendance({ ...newAttendance, check_out: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={newAttendance.status}
                      onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half Day</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await attendanceAPI.create({ ...newAttendance, staff_id: +newAttendance.staff_id });
                    setFormMsg("Attendance marked");
                    setNewAttendance({ staff_id: "", date: "", check_in: "09:00", check_out: "18:00", status: "present" });
                    attendanceAPI.list({}).then((r) => setAttendanceList(r.data));
                  } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
                }}><Clock size={14} /> Mark Attendance</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Clock size={20} /> Attendance Records ({attendanceList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Staff</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {attendanceList.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.staff_name || staffList.find((s) => s.id === a.staff_id)?.name || `#${a.staff_id}`}</td>
                        <td>{a.date}</td>
                        <td>{a.check_in || "—"}</td>
                        <td>{a.check_out || "—"}</td>
                        <td><span className={`badge badge-${a.status === "present" ? "success" : a.status === "absent" ? "danger" : "warning"}`}>{a.status}</span></td>
                        <td><button className="btn btn-sm btn-danger" onClick={async () => {
                          await attendanceAPI.delete(a.id);
                          attendanceAPI.list({}).then((r) => setAttendanceList(r.data));
                        }}><Trash2 size={12} /> Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── PAYROLL ── */}
          {tab === "Payroll" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Create Payroll Entry</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Staff Member</label>
                    <select className="form-control" value={newPayroll.staff_id}
                      onChange={(e) => setNewPayroll({ ...newPayroll, staff_id: e.target.value })}>
                      <option value="">Select Staff</option>
                      {staffList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Month</label>
                    <select className="form-control" value={newPayroll.month}
                      onChange={(e) => setNewPayroll({ ...newPayroll, month: +e.target.value })}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString("default", { month: "long" })}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input className="form-control" type="number" value={newPayroll.year}
                      onChange={(e) => setNewPayroll({ ...newPayroll, year: +e.target.value })} />
                  </div>
                  {[["Base Salary (Rs.)", "base_salary"], ["Bonus (Rs.)", "bonus"], ["Deductions (Rs.)", "deductions"]].map(([label, key]) => (
                    <div className="form-group" key={key}>
                      <label>{label}</label>
                      <input className="form-control" type="number" value={newPayroll[key]}
                        onChange={(e) => setNewPayroll({ ...newPayroll, [key]: +e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="admin-payroll-summary">
                  Net Salary: <strong>Rs.{(newPayroll.base_salary + newPayroll.bonus - newPayroll.deductions).toFixed(0)}</strong>
                </div>
                <button className="btn btn-primary" onClick={async () => {
                  try {
                    await payrollAPI.create({ ...newPayroll, staff_id: +newPayroll.staff_id });
                    setFormMsg("Payroll created");
                    setNewPayroll({ staff_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), base_salary: 0, bonus: 0, deductions: 0 });
                    payrollAPI.list({}).then((r) => setPayrollList(r.data));
                  } catch (e) { setFormMsg("Error: " + (e.response?.data?.detail || "failed")); }
                }}><DollarSign size={14} /> Create Payroll</button>
              </div>
              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><DollarSign size={20} /> Payroll Records ({payrollList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Staff</th><th>Period</th><th>Base</th><th>Bonus</th><th>Deductions</th><th>Net</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {payrollList.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.staff_name || staffList.find((s) => s.id === p.staff_id)?.name || `#${p.staff_id}`}</td>
                        <td>{new Date(2024, p.month - 1).toLocaleString("default", { month: "short" })} {p.year}</td>
                        <td>Rs.{p.base_salary}</td>
                        <td style={{ color: "var(--success)" }}>+Rs.{p.bonus}</td>
                        <td style={{ color: "var(--danger)" }}>-Rs.{p.deductions}</td>
                        <td style={{ fontWeight: 700 }}>Rs.{p.net_salary}</td>
                        <td><span className={`badge badge-${p.status === "paid" ? "success" : p.status === "hold" ? "danger" : "warning"}`}>{p.status}</span></td>
                        <td>
                          {p.status === "pending" && (
                            <div className="admin-action-btns">
                              <button className="btn btn-sm btn-primary" onClick={async () => {
                                await payrollAPI.markPaid(p.id);
                                payrollAPI.list({}).then((r) => setPayrollList(r.data));
                              }}><Check size={12} /> Pay</button>
                              <button className="btn btn-sm btn-danger" onClick={async () => {
                                await payrollAPI.hold(p.id);
                                payrollAPI.list({}).then((r) => setPayrollList(r.data));
                              }}><X size={12} /> Hold</button>
                            </div>
                          )}
                          {p.status === "paid" && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Paid {p.paid_date}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── DISCOUNTS ── */}
          {tab === "Discounts" && (
            <>
              <div className="admin-section-header">
                <h2><Plus size={20} /> Create Discount</h2>
              </div>
              <div className="admin-form-card">
                <div className="admin-form-grid">
                  <div className="form-group">
                    <label>Service</label>
                    <select className="form-control" value={newDiscount.service_id}
                      onChange={(e) => setNewDiscount({ ...newDiscount, service_id: e.target.value })}>
                      <option value="">Select Service</option>
                      {services.filter((s) => s.is_active).map((s) => (
                        <option key={s.id} value={s.id}>{s.name} (Rs.{s.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Type</label>
                    <select className="form-control" value={newDiscount.discount_type}
                      onChange={(e) => setNewDiscount({ ...newDiscount, discount_type: e.target.value })}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Value</label>
                    <input className="form-control" type="number" min="0" value={newDiscount.discount_value}
                      onChange={(e) => setNewDiscount({ ...newDiscount, discount_value: +e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input className="form-control" type="date" value={newDiscount.start_date}
                      onChange={(e) => setNewDiscount({ ...newDiscount, start_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input className="form-control" type="date" value={newDiscount.end_date}
                      onChange={(e) => setNewDiscount({ ...newDiscount, end_date: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleCreateDiscount}><Percent size={14} /> Create Discount</button>
              </div>

              <div className="admin-section-header" style={{ marginTop: "2rem" }}>
                <h2><Percent size={20} /> All Discounts ({discountsList.length})</h2>
              </div>
              <div className="admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>Service</th><th>Type</th><th>Value</th><th>Period</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {discountsList.map((d) => {
                      const today = new Date().toISOString().split("T")[0];
                      const isExpired = d.end_date < today;
                      const isUpcoming = d.start_date > today;
                      return (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.service_name || `#${d.service_id}`}</td>
                          <td>{d.discount_type === "percentage" ? "Percentage" : "Flat"}</td>
                          <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                            {d.discount_type === "percentage" ? `${d.discount_value}%` : `Rs.${d.discount_value}`}
                          </td>
                          <td style={{ fontSize: "0.82rem" }}>
                            {new Date(d.start_date).toLocaleDateString("en-IN")} — {new Date(d.end_date).toLocaleDateString("en-IN")}
                          </td>
                          <td>
                            <span className={`badge ${d.is_active && !isExpired ? (isUpcoming ? "badge-info" : "badge-success") : "badge-danger"}`}>
                              {!d.is_active ? "Disabled" : isExpired ? "Expired" : isUpcoming ? "Upcoming" : "Active"}
                            </span>
                          </td>
                          <td>
                            <button className={`btn btn-sm ${d.is_active ? "btn-danger" : "btn-primary"}`}
                              onClick={() => handleToggleDiscount(d.id, d.is_active)}>
                              {d.is_active ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {discountsList.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)" }}>No discounts created yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
