import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ordersAPI } from "../services/api";
import {
  Package, Truck, CheckCircle, XCircle, Clock, Search,
  MapPin, CreditCard, RotateCcw, ChevronRight, ShoppingBag,
  Calendar, Star, ArrowRight, Box, Shield
} from "lucide-react";

const STATUS_ICONS = {
  placed: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: RotateCcw,
};

const STATUS_COLORS = {
  placed: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#6c47ff",
  delivered: "#10b981",
  cancelled: "#ef4444",
  returned: "#ef4444",
};

const STATUS_BG = {
  placed: "#fffbeb",
  confirmed: "#eff6ff",
  shipped: "#f5f3ff",
  delivered: "#ecfdf5",
  cancelled: "#fef2f2",
  returned: "#fef2f2",
};

export default function Orders() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const newOrder = location.state?.newOrder;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.myOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    setTrackError("");
    setTrackedOrder(null);
    try {
      const res = await ordersAPI.track(trackingId);
      setTrackedOrder(res.data);
    } catch {
      setTrackError("Order not found with this tracking ID");
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await ordersAPI.cancel(id);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.detail || "Cannot cancel");
    }
  };

  const statusSteps = ["placed", "confirmed", "shipped", "delivered"];

  const filteredOrders = activeFilter === "all" ? orders : orders.filter(o => o.status === activeFilter);

  const orderCounts = {
    all: orders.length,
    placed: orders.filter(o => o.status === "placed").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  return (
    <div className="ecom-orders">
      {/* Order Header */}
      <div className="ecom-orders-header">
        <div className="ecom-orders-header-left">
          <Package size={28} />
          <div>
            <h1>My Orders</h1>
            <p>{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/store")}>
          <ShoppingBag size={16} /> Continue Shopping
        </button>
      </div>

      {/* New Order Alert */}
      {newOrder && (
        <div className="ecom-order-success">
          <CheckCircle size={22} />
          <div>
            <strong>Order placed successfully!</strong>
            <p>Your tracking ID is <code>{newOrder.tracking_id}</code></p>
          </div>
        </div>
      )}

      {/* Tracking Box */}
      <div className="ecom-track-box">
        <div className="ecom-track-box-left">
          <Search size={22} />
          <div>
            <h3>Track Your Order</h3>
            <p>Enter your tracking ID to see real-time status</p>
          </div>
        </div>
        <form className="ecom-track-form" onSubmit={handleTrack}>
          <input
            type="text"
            placeholder="e.g., SS-ABC12345"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Track
          </button>
        </form>
      </div>

      {trackError && <div className="ecom-track-error"><XCircle size={16} /> {trackError}</div>}

      {trackedOrder && (
        <div className="ecom-tracked-result">
          <div className="ecom-tracked-info">
            <h3>Order #{trackedOrder.id}</h3>
            <code>{trackedOrder.tracking_id}</code>
            <span className="ecom-tracked-amount">Rs.{trackedOrder.total_amount}</span>
          </div>
          <div className="ecom-progress-bar">
            {statusSteps.map((step, i) => {
              const stepIndex = statusSteps.indexOf(trackedOrder.status);
              const isActive = i <= stepIndex;
              const isCurrent = i === stepIndex;
              const StepIcon = STATUS_ICONS[step];
              return (
                <React.Fragment key={step}>
                  <div className={`ecom-progress-step ${isActive ? "active" : ""} ${isCurrent ? "current" : ""}`}>
                    <div className="ecom-progress-circle">
                      <StepIcon size={16} />
                    </div>
                    <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`ecom-progress-connector ${isActive && i < stepIndex ? "active" : ""}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Order Filters */}
      <div className="ecom-order-filters">
        {[
          { key: "all", label: "All Orders" },
          { key: "placed", label: "Pending" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`ecom-order-filter ${activeFilter === key ? "active" : ""}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
            <span className="ecom-filter-count">{orderCounts[key]}</span>
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="loading-center"><span className="spinner" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>{activeFilter === "all" ? "No orders yet" : `No ${activeFilter} orders`}</h3>
          <p>Start shopping from our beauty store!</p>
          <button className="btn btn-primary" onClick={() => navigate("/store")}>
            <ShoppingBag size={16} /> Shop Now
          </button>
        </div>
      ) : (
        <div className="ecom-orders-list">
          {filteredOrders.map((order) => {
            const StatusIcon = STATUS_ICONS[order.status] || Clock;
            const color = STATUS_COLORS[order.status];
            const bg = STATUS_BG[order.status];
            return (
              <div key={order.id} className="ecom-order-card">
                <div className="ecom-order-card-top">
                  <div className="ecom-order-card-meta">
                    <div className="ecom-order-id-row">
                      <span className="ecom-order-number">Order #{order.id}</span>
                      <code className="ecom-order-tracking">{order.tracking_id}</code>
                    </div>
                    <div className="ecom-order-date">
                      <Calendar size={13} />
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div className="ecom-order-status" style={{ background: bg, color }}>
                    <StatusIcon size={14} />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>

                <div className="ecom-order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="ecom-order-item">
                      <div className="ecom-order-item-img">
                        <Box size={20} />
                      </div>
                      <div className="ecom-order-item-info">
                        <span className="ecom-order-item-name">{item.product_name || `Product #${item.product_id}`}</span>
                        <span className="ecom-order-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="ecom-order-item-price">Rs.{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="ecom-order-card-bottom">
                  <div className="ecom-order-bottom-meta">
                    <span><CreditCard size={13} /> {order.payment_method}</span>
                    {order.shipping_address && <span><MapPin size={13} /> {order.shipping_address.substring(0, 40)}{order.shipping_address.length > 40 ? "..." : ""}</span>}
                  </div>
                  <div className="ecom-order-bottom-right">
                    <span className="ecom-order-total">Rs.{order.total_amount.toFixed(0)}</span>
                    {(order.status === "placed" || order.status === "confirmed") && (
                      <button className="ecom-cancel-btn" onClick={() => cancelOrder(order.id)}>
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
