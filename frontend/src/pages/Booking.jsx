import React, { useState, useEffect } from "react";
import { servicesAPI, staffAPI, bookingsAPI, categoriesAPI, packagesAPI, loyaltyAPI, waitlistAPI } from "../services/api";
import ServiceCard from "../components/ServiceCard";
import SlotSelector from "../components/SlotSelector";
import QueueStatus from "../components/QueueStatus";
import {
  Scissors, Users, CalendarDays, CheckCircle2, Package, Clock,
  CreditCard, Smartphone, Wallet, Banknote, Star, ArrowLeft,
  ArrowRight, Sparkles, Gift, AlertCircle, Trophy,
  Smile, Paintbrush, Droplets, Sparkle
} from "lucide-react";

const STEPS = [
  { label: "Service", icon: Scissors },
  { label: "Staff", icon: Users },
  { label: "Date & Slot", icon: CalendarDays },
  { label: "Confirm", icon: CheckCircle2 },
];

const PAYMENT_METHODS = [
  { value: "card", label: "Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "cash", label: "Cash", icon: Banknote },
];

export default function Booking() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [loyaltyBalance, setLoyaltyBalance] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [bookingMode, setBookingMode] = useState("service");
  const [slotsEmpty, setSlotsEmpty] = useState(false);

  useEffect(() => {
    servicesAPI.list().then((r) => setServices(r.data)).catch(() => {});
    staffAPI.list().then((r) => setStaffList(r.data)).catch(() => {});
    categoriesAPI.list().then((r) => setCategories(r.data)).catch(() => {});
    packagesAPI.list().then((r) => setPackages(r.data)).catch(() => {});
    packagesAPI.list().then((r) => setPackages(r.data)).catch(() => {});
    loyaltyAPI.balance().then((r) => setLoyaltyBalance(r.data)).catch(() => {});
  }, []);

  const getCatIcon = (name) => {
    const map = {
      "Hair": Scissors,
      "Beard & Grooming": Smile,
      "Skin Care": Sparkle,
      "Spa": Droplets,
      "Nails": Paintbrush,
      "Bridal": Sparkles
    };
    const Icon = map[name] || Scissors;
    return <Icon size={14} style={{ marginRight: "4px" }} />;
  };

  const minDate = new Date().toISOString().split("T")[0];

  const filteredServices = selectedCategory
    ? services.filter((s) => s.category_id === selectedCategory)
    : services;

  const discount = redeemPoints * 0.5;
  const servicePrice = selectedPackage
    ? selectedPackage.total_price
    : (selectedService?.discounted_price ?? selectedService?.price ?? 0);
  const originalPrice = selectedPackage
    ? selectedPackage.total_price
    : (selectedService?.price ?? 0);
  const hasServiceDiscount = !selectedPackage && selectedService?.discounted_price != null && selectedService.discounted_price < selectedService.price;
  const finalPrice = Math.max(0, servicePrice - discount);

  const handleBook = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await bookingsAPI.create({
        service_id: selectedPackage ? selectedPackage.services[0]?.id : selectedService.id,
        staff_id: selectedStaff.id,
        appointment_date: selectedSlot,
        notes,
        package_id: selectedPackage?.id || null,
        payment_method: paymentMethod,
        redeem_points: redeemPoints > 0 ? redeemPoints : 0,
      });
      setSuccess(res.data);
      setStep(0);
      setSelectedService(null);
      setSelectedStaff(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setSelectedPackage(null);
      setRedeemPoints(0);
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed. Slot may have been taken.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedStaff || !selectedDate || !(selectedService || selectedPackage)) return;
    try {
      await waitlistAPI.join({
        staff_id: selectedStaff.id,
        service_id: selectedPackage ? selectedPackage.services[0]?.id : selectedService.id,
        preferred_date: selectedDate,
      });
      setError("");
      alert("You've been added to the waitlist! We'll notify you when a slot opens up.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to join waitlist");
    }
  };

  /* ─── Success screen ─── */
  if (success) {
    return (
      <div className="up-page">
        <div className="up-success-card">
          <div className="up-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="up-success-queue">
            Queue position: <strong>#{success.queue_position}</strong>
          </p>
          <div className="up-success-details">
            <span>{paymentMethod.toUpperCase()}</span>
            <span>Rs.{finalPrice.toFixed(0)}</span>
            {redeemPoints > 0 && <span>{redeemPoints} pts redeemed</span>}
          </div>
          <p className="up-success-note">
            <AlertCircle size={14} /> Confirmation email & SMS reminders sent
          </p>
          <button className="up-btn up-btn-primary" onClick={() => setSuccess(null)}>
            <Sparkles size={16} /> Book Another
          </button>
        </div>
        <div style={{ marginTop: "1.5rem" }}><QueueStatus /></div>
      </div>
    );
  }

  return (
    <div className="up-page">
      {/* Page Header */}
      <div className="up-page-header">
        <div className="up-page-header-icon"><Scissors size={24} /></div>
        <div>
          <h1>Book an Appointment</h1>
          <p>Choose your service, stylist, and preferred time</p>
        </div>
      </div>

      <QueueStatus />

      {/* Mode toggle */}
      <div className="up-mode-toggle">
        <button className={`up-mode-btn ${bookingMode === "service" ? "active" : ""}`}
          onClick={() => { setBookingMode("service"); setSelectedPackage(null); setStep(0); }}>
          <Scissors size={16} /> Book a Service
        </button>
        <button className={`up-mode-btn ${bookingMode === "package" ? "active" : ""}`}
          onClick={() => { setBookingMode("package"); setSelectedService(null); setStep(0); }}>
          <Package size={16} /> Book a Package
        </button>
      </div>

      {/* Step progress bar */}
      <div className="up-steps">
        {STEPS.map(({ label, icon: Icon }, i) => (
          <div key={label} className={`up-step ${i === step ? "current" : ""} ${i < step ? "done" : ""}`}
            onClick={() => i < step && setStep(i)}>
            <div className="up-step-icon">
              {i < step ? <CheckCircle2 size={18} /> : <Icon size={18} />}
            </div>
            <span className="up-step-label">{label}</span>
            {i < STEPS.length - 1 && <div className="up-step-connector" />}
          </div>
        ))}
      </div>

      {error && <div className="up-alert up-alert-error"><AlertCircle size={16} /> {error}</div>}

      {/* STEP 0: Service */}
      {step === 0 && bookingMode === "service" && (
        <div className="up-animate-in">
          <h2 className="up-section-title">Choose a Service</h2>
          {categories.length > 0 && (
            <div className="up-category-pills">
              <button className={`up-pill ${!selectedCategory ? "active" : ""}`}
                onClick={() => setSelectedCategory(null)}>All</button>
              {categories.map((c) => (
                <button key={c.id}
                  className={`up-pill ${selectedCategory === c.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(c.id)}>
                  {getCatIcon(c.name)} {c.name}
                </button>
              ))}
            </div>
          )}
          <div className="services-grid stagger-children">
            {filteredServices.map((s) => (
              <ServiceCard key={s.id} service={s} selected={selectedService?.id === s.id}
                onSelect={(svc) => { setSelectedService(svc); setStep(1); }} />
            ))}
          </div>
        </div>
      )}

      {step === 0 && bookingMode === "package" && (
        <div className="up-animate-in">
          <h2 className="up-section-title">Choose a Package</h2>
          <div className="up-packages-grid has-image-grid stagger-children">
            {packages.map((pkg, idx) => (
              <div key={pkg.id}
                className={`up-package-card has-image ${selectedPackage?.id === pkg.id ? "selected" : ""}`}
                onClick={() => { setSelectedPackage(pkg); setSelectedService(pkg.services[0] || null); setStep(1); }}>
                
                <div className="up-package-image-wrapper">
                  <img src={`https://images.unsplash.com/photo-${idx % 2 === 0 ? "1521590832168-3fb368c854c6" : "1560066984-138dadb4c035"}?auto=format&fit=crop&q=80&w=600`} alt={pkg.name} />
                  {pkg.discount_percent > 0 && (
                    <div className="up-package-discount-badge">{pkg.discount_percent}% OFF</div>
                  )}
                </div>

                <div className="up-package-content">
                  <h3>{pkg.name}</h3>
                  {pkg.description && <p className="up-package-desc">{pkg.description}</p>}
                  <div className="up-package-services">
                    {pkg.services.map((s) => s.name).join(" + ")}
                  </div>
                  <div className="up-package-footer">
                    <span className="up-package-price">Rs.{pkg.total_price.toFixed(0)}</span>
                    <div className="up-package-duration"><Clock size={14} style={{ marginRight: "4px" }} /> {pkg.total_duration} min</div>
                  </div>
                </div>

                {selectedPackage?.id === pkg.id && (
                  <div className="up-package-selected"><CheckCircle2 size={16} /></div>
                )}
              </div>
            ))}
            {packages.length === 0 && (
              <div className="up-empty" style={{ gridColumn: "1 / -1" }}>
                <Package size={40} />
                <p>No packages available yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: Staff */}
      {step === 1 && (
        <div className="up-animate-in">
          <h2 className="up-section-title">Choose a Stylist</h2>
          <div className="up-staff-grid stagger-children">
            {staffList.map((s) => (
              <div key={s.id}
                className={`up-staff-card ${selectedStaff?.id === s.id ? "selected" : ""}`}
                onClick={() => { setSelectedStaff(s); setStep(2); }}>
                
                <img className="up-staff-avatar-img" src={`https://api.dicebear.com/7.x/notionists/svg?seed=${s.name}&backgroundColor=f1f5f9`} alt={s.name} />

                <h3>{s.name}</h3>
                <p className="up-staff-spec">{s.specialization}</p>
                <div className="up-staff-meta">
                  <span><Star size={12} /> {s.experience_years} yrs exp</span>
                  <span><Clock size={12} /> {s.work_start} – {s.work_end}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="up-btn up-btn-outline" onClick={() => setStep(0)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      )}

      {/* STEP 2: Date & Slot */}
      {step === 2 && (
        <div className="up-animate-in">
          <h2 className="up-section-title">Choose Date & Time</h2>
          <div className="up-card">
            <div className="up-form-group">
              <label><CalendarDays size={14} /> Select Date</label>
              <input className="up-input" type="date" min={minDate} value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); setSlotsEmpty(false); }}
                style={{ maxWidth: 280 }} />
            </div>
            {selectedDate && (
              <>
                <h3 className="up-section-title" style={{ marginTop: "1.25rem" }}>Available Slots</h3>
                <SlotSelector
                  staffId={selectedStaff?.id}
                  serviceId={selectedPackage ? selectedPackage.services[0]?.id : selectedService?.id}
                  date={selectedDate} selected={selectedSlot} onSelect={setSelectedSlot}
                  onSlotsLoaded={(slots) => setSlotsEmpty(slots.length === 0 || slots.every((s) => !s.is_available))}
                />
                {slotsEmpty && (
                  <div className="up-waitlist-box">
                    <p>No slots available for this date.</p>
                    <button className="up-btn up-btn-primary up-btn-sm" onClick={handleJoinWaitlist}>
                      Join Waitlist
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="up-btn-group">
            <button className="up-btn up-btn-outline" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="up-btn up-btn-primary" disabled={!selectedSlot} onClick={() => setStep(3)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Confirm */}
      {step === 3 && (
        <div className="up-animate-in">
          <h2 className="up-section-title">Review & Confirm</h2>
          <div className="up-card" style={{ maxWidth: 580 }}>
            {/* Summary */}
            <div className="up-summary-rows">
              {[
                [selectedPackage ? "Package" : "Service", selectedPackage ? selectedPackage.name : selectedService?.name],
                ["Staff", selectedStaff?.name],
                ["Date & Time", selectedSlot ? new Date(selectedSlot).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""],
              ].map(([label, value]) => (
                <div key={label} className="up-summary-row">
                  <span className="up-summary-label">{label}</span>
                  <span className="up-summary-value">{value}</span>
                </div>
              ))}
            </div>

            {/* Payment method */}
            <div className="up-section" style={{ marginTop: "1.5rem" }}>
              <label className="up-label">Payment Method</label>
              <div className="up-payment-grid">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <button key={value}
                    className={`up-payment-btn ${paymentMethod === value ? "active" : ""}`}
                    onClick={() => setPaymentMethod(value)}>
                    <Icon size={18} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loyalty points */}
            {loyaltyBalance && loyaltyBalance.points > 0 && (
              <div className="up-loyalty-box">
                <label className="up-label">
                  <Trophy size={14} /> Redeem Loyalty ({loyaltyBalance.points} pts = Rs.{loyaltyBalance.value})
                </label>
                <div className="up-loyalty-controls">
                  <input className="up-input" type="number" min="0" max={loyaltyBalance.points}
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(Math.min(+e.target.value, loyaltyBalance.points))}
                    style={{ maxWidth: 100 }} />
                  <span className="up-loyalty-value">= Rs.{discount.toFixed(0)} off</span>
                  <button className="up-btn up-btn-outline up-btn-sm"
                    onClick={() => setRedeemPoints(Math.min(loyaltyBalance.points, Math.ceil(servicePrice / 0.5)))}>
                    Max
                  </button>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="up-total-box">
              {hasServiceDiscount && (
                <div className="up-total-row sub">
                  <span>Original Price</span>
                  <span style={{ textDecoration: "line-through" }}>Rs.{originalPrice.toFixed(0)}</span>
                </div>
              )}
              {hasServiceDiscount && (
                <div className="up-total-row sub">
                  <span>Discount ({selectedService.discount_type === "percentage" ? `${selectedService.discount_value}%` : `Rs.${selectedService.discount_value}`})</span>
                  <span>-Rs.{(originalPrice - servicePrice).toFixed(0)}</span>
                </div>
              )}
              {redeemPoints > 0 && (
                <div className="up-total-row sub">
                  <span>Loyalty ({redeemPoints} pts)</span>
                  <span>-Rs.{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="up-total-row main">
                <span>Total</span>
                <span>Rs.{finalPrice.toFixed(0)}</span>
              </div>
            </div>

            <div className="up-form-group" style={{ marginTop: "1.25rem" }}>
              <label>Notes (optional)</label>
              <textarea className="up-input" rows={2} placeholder="Any special requests..."
                value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          <div className="up-btn-group">
            <button className="up-btn up-btn-outline" onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="up-btn up-btn-primary up-btn-lg" onClick={handleBook} disabled={loading} style={{ flex: 1 }}>
              {loading ? <span className="spinner" style={{ width: "1rem", height: "1rem" }} /> : (
                <><CheckCircle2 size={18} /> Confirm & Pay Rs.{finalPrice.toFixed(0)}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
