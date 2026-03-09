import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI, ordersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart, Trash2, Plus, Minus, CreditCard,
  Package, ArrowLeft, MapPin, Truck, User, Mail, Award, Shield, CheckCircle2
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({
    payment_method: "card",
    shipping_address: "",
    notes: "",
  });

  useEffect(() => { loadCart(); }, []);

  const loadCart = async () => {
    try {
      const res = await cartAPI.list();
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, productId, newQty) => {
    if (newQty < 1) return;
    try {
      await cartAPI.update(itemId, { product_id: productId, quantity: newQty });
      setItems(items.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed");
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch {
      alert("Failed to remove");
    }
  };

  const clearCart = async () => {
    try { await cartAPI.clear(); setItems([]); } catch { alert("Failed"); }
  };

  const getItemPrice = (item) => item.product_discount_price || item.product_price;
  const subtotal = items.reduce((sum, i) => sum + getItemPrice(i) * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    if (!orderForm.shipping_address.trim()) { alert("Please enter a shipping address"); return; }
    setOrdering(true);
    try {
      const res = await ordersAPI.create(orderForm);
      navigate("/orders", { state: { newOrder: res.data } });
    } catch (err) {
      alert(err.response?.data?.detail || "Order failed");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return <div className="up-page"><div className="up-loading"><span className="spinner" /></div></div>;
  }

  return (
    <div className="ecom-store" style={{ minHeight: "calc(100vh - 80px)", paddingTop: "2rem" }}>
      <div className="ecom-cart-container">
        
        {/* Left Side: Header & Items */}
        <div className="ecom-cart-main">
          
          <div className="ecom-cart-header">
            <div>
              <h1><ShoppingCart size={28} style={{ color: "var(--primary)" }} /> My Cart</h1>
              <p className="ecom-cart-subtitle" style={{ marginTop: "4px" }}>
                {items.length} item{items.length !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/store")}>
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>

          {items.length === 0 ? (
            <div className="ecom-empty-cart animate-fade-in-up">
              <div className="ecom-empty-icon"><ShoppingCart size={32} /></div>
              <h3>Your cart is completely empty</h3>
              <p>Looks like you haven't added any essentials to your cart yet.</p>
              <button className="btn btn-primary" onClick={() => navigate("/store")}>
                <Package size={16} /> Explore Store
              </button>
            </div>
          ) : (
            <div className="ecom-cart-items stagger-children">
              {items.map((item) => (
                <div key={item.id} className="ecom-cart-item">
                  <div className="ecom-cart-img">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} />
                    ) : (
                      <Package size={32} color="#cbd5e1" />
                    )}
                  </div>
                  <div className="ecom-cart-details">
                    <h3 className="ecom-cart-title">{item.product_name}</h3>
                    <div className="ecom-cart-price-row">
                      <span className="ecom-cart-price">Rs.{getItemPrice(item)}</span>
                      {item.product_discount_price && (
                        <span className="ecom-cart-original-price">Rs.{item.product_price}</span>
                      )}
                    </div>
                  </div>
                  <div className="ecom-cart-controls">
                    <div className="ecom-qty-picker">
                      <button onClick={() => updateQuantity(item.id, item.product_id, item.quantity - 1)}>
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.product_id, item.quantity + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text)" }}>
                      Rs.{(getItemPrice(item) * item.quantity).toFixed(0)}
                    </span>
                    <button className="ecom-cart-remove" onClick={() => removeItem(item.id)} title="Remove from cart">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Summary (Only if items exist) */}
        {items.length > 0 && (
          <div className="ecom-cart-summary">
            <h2><CreditCard size={20} /> Order Summary</h2>
            
            <div className="ecom-summary-row">
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>Rs.{subtotal.toFixed(0)}</span>
            </div>
            
            <div className="ecom-summary-row">
              <span>Shipping cost</span>
              <span style={{ fontWeight: 700, color: shipping === 0 ? "var(--success)" : "var(--text)" }}>
                {shipping === 0 ? "FREE" : `Rs.${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                Add Rs.{(499 - subtotal).toFixed(0)} more for FREE shipping
              </p>
            )}

            <div className="ecom-summary-total">
              <span>Total</span>
              <span>Rs.{total.toFixed(0)}</span>
            </div>

            {!showCheckout ? (
              <button className="ecom-checkout-btn" onClick={() => setShowCheckout(true)}>
                Proceed to Checkout <ArrowLeft size={18} style={{ transform: "rotate(180deg)" }} />
              </button>
            ) : (
              <div className="ecom-checkout-form">
                <div style={{ marginBottom: "1.5rem", background: "var(--surface-hover)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deliver To</h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}><User size={14} /> {user?.name || "Guest"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}><Mail size={14} /> {user?.email || "No email provided"}</div>
                </div>
                
                <div className="form-group">
                  <label><MapPin size={14} style={{ display: "inline", marginBottom: "-2px", marginRight: "4px" }} /> Shipping Address</label>
                  <textarea className="form-control" placeholder="Enter your full complete address..."
                    value={orderForm.shipping_address}
                    onChange={(e) => setOrderForm({ ...orderForm, shipping_address: e.target.value })}
                    rows={3} />
                </div>
                
                <div className="form-group">
                  <label><CreditCard size={14} style={{ display: "inline", marginBottom: "-2px", marginRight: "4px" }} /> Payment Method</label>
                  <select className="form-control" value={orderForm.payment_method}
                    onChange={(e) => setOrderForm({ ...orderForm, payment_method: e.target.value })}>
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="cash">Cash on Delivery (COD)</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Order Notes (optional)</label>
                  <input className="form-control" type="text" placeholder="Any special instructions..."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
                </div>
                
                <button className="ecom-checkout-btn" onClick={placeOrder} disabled={ordering}>
                  {ordering ? <span className="spinner" style={{ width: "1.2rem", height: "1.2rem", borderWidth: "2px", borderTopColor: "white", animationDuration: "1s" }} /> : (
                    <><CheckCircle2 size={18} /> Place Order • Rs.{total.toFixed(0)}</>
                  )}
                </button>
              </div>
            )}
            
            <div className="ecom-secure-badge">
              <Shield size={16} /> 100% Secure Checkout Guarantee
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
