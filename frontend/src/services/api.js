/**
 * SmartSalon API — All HTTP calls go through this module.
 * JWT token is attached automatically via request interceptor.
 */

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// ─── SERVICES ─────────────────────────────────────────────────────────────────
export const servicesAPI = {
  list: () => api.get("/services/"),
  listAll: () => api.get("/services/all"),
  create: (data) => api.post("/services/", data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: () => api.get("/categories/"),
  listAll: () => api.get("/categories/all"),
  create: (data) => api.post("/categories/", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// ─── STAFF ────────────────────────────────────────────────────────────────────
export const staffAPI = {
  list: () => api.get("/staff/"),
  create: (data) => api.post("/staff/", data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  getSlots: (staffId, date, serviceId) =>
    api.get(`/staff/${staffId}/slots?date=${date}&service_id=${serviceId}`),
};

// ─── STAFF LEAVES ─────────────────────────────────────────────────────────────
export const staffLeavesAPI = {
  list: () => api.get("/staff-leaves/"),
  staffLeaves: (staffId) => api.get(`/staff-leaves/staff/${staffId}`),
  checkAvailable: (staffId, date) => api.get(`/staff-leaves/staff/${staffId}/check?check_date=${date}`),
  create: (data) => api.post("/staff-leaves/", data),
  delete: (id) => api.delete(`/staff-leaves/${id}`),
};

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (data) => api.post("/bookings/", data),
  myBookings: () => api.get("/bookings/my"),
  myQueue: () => api.get("/bookings/my/queue"),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  reschedule: (id, data) => api.put(`/bookings/${id}/reschedule`, data),
  adminAll: () => api.get("/bookings/admin/all"),
  adminUpdateStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  initiate: (data) => api.post("/payments/initiate", data),
  confirm: (id) => api.put(`/payments/${id}/confirm`),
  refund: (id) => api.put(`/payments/${id}/refund`),
  myPayments: () => api.get("/payments/my"),
  bookingPayment: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  adminAll: () => api.get("/payments/admin/all"),
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  create: (data) => api.post("/reviews/", data),
  staffReviews: (staffId) => api.get(`/reviews/staff/${staffId}`),
  serviceReviews: (serviceId) => api.get(`/reviews/service/${serviceId}`),
  myReviews: () => api.get("/reviews/my"),
  staffAverage: (staffId) => api.get(`/reviews/staff/${staffId}/average`),
};

// ─── WAITLIST ─────────────────────────────────────────────────────────────────
export const waitlistAPI = {
  join: (data) => api.post("/waitlist/", data),
  myWaitlist: () => api.get("/waitlist/my"),
  leave: (id) => api.delete(`/waitlist/${id}`),
  adminAll: () => api.get("/waitlist/admin/all"),
};

// ─── PACKAGES ─────────────────────────────────────────────────────────────────
export const packagesAPI = {
  list: () => api.get("/packages/"),
  listAll: () => api.get("/packages/all"),
  create: (data) => api.post("/packages/", data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
};

// ─── LOCATIONS ────────────────────────────────────────────────────────────────
export const locationsAPI = {
  list: () => api.get("/locations/"),
  listAll: () => api.get("/locations/all"),
  create: (data) => api.post("/locations/", data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

// ─── LOYALTY ──────────────────────────────────────────────────────────────────
export const loyaltyAPI = {
  balance: () => api.get("/loyalty/balance"),
  history: () => api.get("/loyalty/history"),
  redeem: (data) => api.post("/loyalty/redeem", data),
  adminAll: () => api.get("/loyalty/admin/all"),
};

// ─── CANCELLATION POLICIES ───────────────────────────────────────────────────
export const policiesAPI = {
  list: () => api.get("/cancellation-policies/"),
  create: (data) => api.post("/cancellation-policies/", data),
  update: (id, data) => api.put(`/cancellation-policies/${id}`, data),
  delete: (id) => api.delete(`/cancellation-policies/${id}`),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: () => api.get("/notifications/"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/mark-all-read"),
};

// ─── DISCOUNTS ───────────────────────────────────────────────────────────────
export const discountsAPI = {
  list: () => api.get("/discounts/"),
  listAll: () => api.get("/discounts/all"),
  create: (data) => api.post("/discounts/", data),
  update: (id, data) => api.put(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get("/analytics/summary"),
  peakHours: () => api.get("/analytics/peak-hours"),
  popularServices: () => api.get("/analytics/popular-services"),
  dailyBookings: () => api.get("/analytics/daily-bookings"),
  users: () => api.get("/analytics/users/all"),
  toggleUserActive: (id) => api.put(`/analytics/users/${id}/toggle-active`),
};

// ─── PRODUCTS ───────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params) => api.get("/products", { params }),
  listAll: () => api.get("/products/all"),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  categories: () => api.get("/product-categories"),
  createCategory: (data) => api.post("/product-categories", data),
};

// ─── CART ────────────────────────────────────────────────────────────────────
export const cartAPI = {
  list: () => api.get("/cart/"),
  add: (data) => api.post("/cart/", data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete("/cart/"),
};

// ─── ORDERS ─────────────────────────────────────────────────────────────────
export const ordersAPI = {
  create: (data) => api.post("/orders/", data),
  myOrders: () => api.get("/orders/my"),
  getOrder: (id) => api.get(`/orders/my/${id}`),
  track: (trackingId) => api.get(`/orders/track/${trackingId}`),
  cancel: (id) => api.put(`/orders/my/${id}/cancel`),
  adminAll: (params) => api.get("/orders/admin/all", { params }),
  adminUpdateStatus: (id, status) => api.put(`/orders/admin/${id}/status?status=${status}`),
};

// ─── CHAT ───────────────────────────────────────────────────────────────────
export const chatAPI = {
  send: (data) => api.post("/chat/", data),
  history: () => api.get("/chat/history"),
};

// ─── TTS ───────────────────────────────────────────────────────────────────────
export const ttsAPI = {
  /** Returns a URL you can pass to new Audio(...) to play gTTS audio */
  speakUrl: (text, lang) => {
    const token = localStorage.getItem("token") || "";
    const base = process.env.REACT_APP_API_URL || "http://localhost:8000";
    const params = new URLSearchParams({ text, lang });
    return `${base}/api/tts/speak?${params.toString()}${token ? "&token=" + token : ""}`;
  },
  /** Fetch audio blob for playing */
  speak: (text, lang) =>
    api.get("/tts/speak", { params: { text, lang }, responseType: "blob" }),
};

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
export const attendanceAPI = {
  list: (params) => api.get("/attendance/", { params }),
  create: (data) => api.post("/attendance/", data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  summary: (month, year) => api.get(`/attendance/summary?month=${month}&year=${year}`),
};

// ─── PAYROLL ────────────────────────────────────────────────────────────────
export const payrollAPI = {
  list: (params) => api.get("/payroll/", { params }),
  create: (data) => api.post("/payroll/", data),
  markPaid: (id) => api.put(`/payroll/${id}/pay`),
  hold: (id) => api.put(`/payroll/${id}/hold`),
  delete: (id) => api.delete(`/payroll/${id}`),
};

export default api;
