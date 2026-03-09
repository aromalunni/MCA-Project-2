import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../services/api";
import {
  Scissors, Calendar, Users, BarChart3, Brain, Upload, Palette,
  Clock, Star, ChevronRight, Sparkles, Zap, Shield, ArrowRight,
  Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube,
  CheckCircle2, Play, Heart, Award, TrendingUp, Wand2,
  ShoppingBag, ShoppingCart, Tag, Truck, Search, Grid3X3, List,
  Smile, Droplets, Paintbrush
} from "lucide-react";

/* ─── Intersection Observer Hook ─── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15, ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

/* ─── Animated Counter ─── */
function Counter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`landing-feature-card ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="landing-feature-icon">
        <Icon size={28} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ─── Step Card ─── */
function StepCard({ num, icon: Icon, title, desc, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`landing-step-card ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="landing-step-num">{num}</div>
      <div className="landing-step-icon"><Icon size={32} strokeWidth={1.5} /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ─── Service Card ─── */
const SERVICE_IMAGES = {
  "Haircut": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
  "Beard Styling": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
  "Hair Coloring": "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=600",
  "Hair Spa": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
  "Facial": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600",
};

function LandingServiceCard({ icon: Icon, title, desc, price, duration, delay = 0 }) {
  const [ref, inView] = useInView();
  const img = SERVICE_IMAGES[title] || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600";
  return (
    <div ref={ref} className={`landing-svc-card ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms`, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Image with hover zoom */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", background: "#f1f5f9" }}>
        <img
          src={img}
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s ease", display: "block" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        />
        {/* Duration badge */}
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={12} /> {duration} min
        </div>
        {/* Icon badge */}
        <div style={{ position: "absolute", top: 12, left: 12, background: "var(--primary)", color: "white", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ marginBottom: "0.35rem" }}>{title}</h3>
        <p style={{ marginBottom: "1rem", flex: 1 }}>{desc}</p>
        <div className="landing-svc-meta" style={{ marginBottom: "1rem" }}>
          <span className="landing-svc-price">Rs.{price}</span>
          <span style={{ fontSize: "0.8rem", color: "var(--success)", fontWeight: 700 }}>✓ Expert Stylists</span>
        </div>
        <Link to="/booking" className="btn btn-primary btn-sm" style={{ width: "100%", textAlign: "center" }}>
          Book Now <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Testimonial ─── */
function Testimonial({ name, role, text, rating, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`landing-testimonial ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="landing-testimonial-stars">
        {Array.from({ length: rating }, (_, i) => <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />)}
      </div>
      <p>"{text}"</p>
      <div className="landing-testimonial-author">
        <div className="landing-testimonial-avatar">{name[0]}</div>
        <div>
          <div className="landing-testimonial-name">{name}</div>
          <div className="landing-testimonial-role">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Product Card ─── */
function LandingProductCard({ product, discount, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`landing-product-card ${inView ? "visible" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
      {discount > 0 && <div className="landing-product-badge"><Tag size={12} /> {discount}% OFF</div>}
      <div className="landing-product-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <ShoppingBag size={36} strokeWidth={1} />
        )}
      </div>
      <div className="landing-product-info">
        <span className="landing-product-brand">{product.brand}</span>
        <h3>{product.name}</h3>
        <p className="landing-product-desc">{product.description}</p>
        <div className="landing-product-meta">
          <span className={`landing-product-gender ${product.gender}`}>{product.gender}</span>
          {product.rating > 0 && (
            <span className="landing-product-rating">
              <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="landing-product-pricing">
          <span className="landing-product-sale">Rs.{product.discount_price || product.price}</span>
          {product.discount_price && <span className="landing-product-mrp">Rs.{product.price}</span>}
          {discount > 0 && <span className="landing-product-off">{discount}% off</span>}
        </div>
        {product.stock > 0 && product.stock <= 5 && (
          <span className="landing-product-low-stock">Only {product.stock} left!</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [heroRef, heroInView] = useInView();
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeGender, setStoreGender] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [storeSortBy, setStoreSortBy] = useState("popular");
  const [storeViewMode, setStoreViewMode] = useState("grid");
  const [storeWishlist, setStoreWishlist] = useState([]);

  useEffect(() => {
    productsAPI.list({}).then(res => {
      setStoreProducts(res.data);
      setStoreLoading(false);
    }).catch(() => setStoreLoading(false));
  }, []);

  const filteredStoreProducts = storeProducts
    .filter(p => !storeGender || p.gender === storeGender)
    .filter(p => !storeSearch || p.name.toLowerCase().includes(storeSearch.toLowerCase()) || p.brand?.toLowerCase().includes(storeSearch.toLowerCase()))
    .sort((a, b) => {
      if (storeSortBy === "price-low") return (a.discount_price || a.price) - (b.discount_price || b.price);
      if (storeSortBy === "price-high") return (b.discount_price || b.price) - (a.discount_price || a.price);
      if (storeSortBy === "rating") return b.rating - a.rating;
      if (storeSortBy === "newest") return b.id - a.id;
      return b.total_reviews - a.total_reviews;
    });

  return (
    <div className="landing">
      {/* ── NAVBAR ── */}
      <nav className="landing-nav">
        <Link to="/" className="landing-nav-brand">
          <Scissors size={24} /> SmartSalon
        </Link>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#services">Services</a>
          <a href="#ai-preview">AI Preview</a>
          <a href="#testimonials">Reviews</a>
          <a href="#store">Store</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost">Log In</Link>
          <Link to="/register" className="btn btn-primary">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className={`landing-hero ${heroInView ? "visible" : ""}`}>
        <div className="landing-hero-bg">
          <div className="landing-hero-orb landing-hero-orb-1" />
          <div className="landing-hero-orb landing-hero-orb-2" />
          <div className="landing-hero-orb landing-hero-orb-3" />
        </div>
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Sparkles size={14} /> AI-Powered Platform
          </div>
          <h1>
            The Future of
            <span className="landing-gradient-text"> Salon Booking</span>
            <br />is Here
          </h1>
          <p className="landing-hero-sub">
            Experience AI-powered hairstyle previews, real-time scheduling,
            smart queue management, and seamless booking — all in one beautiful platform.
          </p>
          <div className="landing-hero-cta">
            <Link to="/booking" className="btn btn-primary btn-lg">
              <Calendar size={18} /> Book Appointment
            </Link>
            <a href="#ai-preview" className="btn btn-outline-white btn-lg">
              <Play size={18} /> Try AI Preview
            </a>
            <Link to="/store" className="btn btn-outline-white btn-lg">
              <ShoppingBag size={18} /> Beauty Store
            </Link>
          </div>
          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-val"><Counter end={5000} suffix="+" /></div>
              <div className="landing-hero-stat-label">Happy Clients</div>
            </div>
            <div className="landing-hero-stat-divider" />
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-val"><Counter end={50} suffix="+" /></div>
              <div className="landing-hero-stat-label">Expert Stylists</div>
            </div>
            <div className="landing-hero-stat-divider" />
            <div className="landing-hero-stat">
              <div className="landing-hero-stat-val"><Counter end={4} suffix=".9" /></div>
              <div className="landing-hero-stat-label">Rating</div>
            </div>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-hero-mockup">
            <div className="landing-mockup-header">
              <div className="landing-mockup-dot" />
              <div className="landing-mockup-dot" />
              <div className="landing-mockup-dot" />
            </div>
            <div className="landing-mockup-body">
              <div className="landing-mockup-card">
                <Scissors size={20} />
                <span>Premium Haircut</span>
                <span className="landing-mockup-price">Rs.299</span>
              </div>
              <div className="landing-mockup-card active">
                <Palette size={20} />
                <span>Hair Coloring</span>
                <span className="landing-mockup-price">Rs.1499</span>
              </div>
              <div className="landing-mockup-card">
                <Sparkles size={20} />
                <span>Hair Spa</span>
                <span className="landing-mockup-price">Rs.999</span>
              </div>
              <div className="landing-mockup-btn">
                <CheckCircle2 size={16} /> Booking Confirmed!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="landing-trusted">
        <p>Trusted by leading salons across Kerala</p>
        <div className="landing-trusted-logos">
          {["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kannur"].map((city) => (
            <div key={city} className="landing-trusted-item">
              <MapPin size={14} /> {city}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-badge"><Zap size={14} /> Features</div>
          <h2>Everything You Need to<br /><span className="landing-gradient-text">Transform Your Salon</span></h2>
          <p>Powerful tools designed for modern salons and smart customers</p>
        </div>
        <div className="landing-features-grid">
          <FeatureCard icon={Brain} title="AI Hairstyle Preview" desc="Upload your photo and preview hairstyles, colors, and beard styles before booking." delay={0} />
          <FeatureCard icon={Calendar} title="Real-time Booking" desc="Book appointments instantly with live availability and smart scheduling." delay={100} />
          <FeatureCard icon={Users} title="Smart Queue System" desc="Know your queue position and estimated wait time in real-time." delay={200} />
          <FeatureCard icon={Award} title="Expert Staff Selection" desc="Choose your preferred stylist based on specialization and reviews." delay={300} />
          <FeatureCard icon={BarChart3} title="Analytics Dashboard" desc="Salon owners get insights on revenue, peak hours, and popular services." delay={400} />
          <FeatureCard icon={Shield} title="Secure Payments" desc="Multiple payment options with loyalty points and discount support." delay={500} />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-header">
          <div className="landing-section-badge"><TrendingUp size={14} /> How It Works</div>
          <h2>Book in<span className="landing-gradient-text"> 4 Simple Steps</span></h2>
          <p>From AI preview to booking confirmation in minutes</p>
        </div>
        <div className="landing-steps-grid">
          <StepCard num="01" icon={Upload} title="Upload Your Photo" desc="Take a selfie or upload your photo for AI hairstyle analysis." delay={0} />
          <StepCard num="02" icon={Wand2} title="Preview Styles" desc="Browse AI-generated hairstyle, color, and beard suggestions." delay={150} />
          <StepCard num="03" icon={Palette} title="Choose & Customize" desc="Pick your perfect look with color and styling options." delay={300} />
          <StepCard num="04" icon={Calendar} title="Book Appointment" desc="Select your stylist, time slot, and confirm your booking." delay={450} />
        </div>
      </section>

      {/* ── AI PREVIEW SECTION ── */}
      <section id="ai-preview" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-badge"><Brain size={14} /> AI Technology</div>
          <h2>AI Hairstyle<span className="landing-gradient-text"> Preview</span></h2>
          <p>See how you'll look before you book — powered by advanced AI</p>
        </div>
        <div className="landing-ai-demo">
          <div className="landing-ai-panel">
            <h3><Upload size={20} /> Upload Photo</h3>
            <div className="landing-ai-upload">
              <div className="landing-ai-upload-icon">
                <Upload size={32} strokeWidth={1.5} />
              </div>
              <p>Drag & drop or click to upload</p>
              <span>Supports JPG, PNG up to 5MB</span>
            </div>
            <div className="landing-ai-options">
              <h4>Hairstyle</h4>
              <div className="landing-ai-pills">
                {["Classic Cut", "Fade", "Undercut", "Pompadour", "Buzz Cut"].map((s, i) => (
                  <span key={s} className={`landing-ai-pill ${i === 2 ? "active" : ""}`}>{s}</span>
                ))}
              </div>
              <h4>Hair Color</h4>
              <div className="landing-ai-colors">
                {["#1a1a2e", "#4a2511", "#8b4513", "#d4a373", "#c0392b", "#2980b9"].map((c, i) => (
                  <div key={c} className={`landing-ai-color ${i === 0 ? "active" : ""}`} style={{ background: c }} />
                ))}
              </div>
              <h4>Beard Style</h4>
              <div className="landing-ai-pills">
                {["Clean Shave", "Stubble", "Full Beard", "Goatee"].map((s, i) => (
                  <span key={s} className={`landing-ai-pill ${i === 1 ? "active" : ""}`}>{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="landing-ai-preview-panel">
            <h3><Sparkles size={20} /> Live Preview</h3>
            <div className="landing-ai-preview-box">
              <div className="landing-ai-preview-placeholder" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                <img src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=1000" alt="AI Preview Simulation" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <Wand2 size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>AI Magic in Action</p>
                </div>
              </div>
            </div>
            <Link to="/register" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Try AI Preview Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="landing-section landing-section-alt">
        <div className="landing-section-header">
          <div className="landing-section-badge"><Scissors size={14} /> Our Services</div>
          <h2>Premium Salon<span className="landing-gradient-text"> Services</span></h2>
          <p>Expert grooming and styling services at your fingertips</p>
        </div>
        <div className="landing-svc-grid">
          <LandingServiceCard icon={Scissors} title="Haircut" desc="Classic to modern cuts by expert stylists" price={299} duration={30} delay={0} />
          <LandingServiceCard icon={Smile} title="Beard Styling" desc="Clean shaping, trim, and grooming" price={149} duration={20} delay={100} />
          <LandingServiceCard icon={Paintbrush} title="Hair Coloring" desc="Full coloring with premium products" price={1499} duration={90} delay={200} />
          <LandingServiceCard icon={Droplets} title="Hair Spa" desc="Nourishing deep conditioning treatment" price={999} duration={60} delay={300} />
          <LandingServiceCard icon={Sparkles} title="Facial" desc="Deep cleansing and rejuvenating facial" price={799} duration={45} delay={400} />
        </div>
      </section>

      {/* ── BEAUTY STORE (Flipkart/Amazon Style) ── */}
      <section id="store" className="landing-ecom-section">
        {/* Store Top Banner */}
        <div className="landing-ecom-banner">
          <Zap size={18} />
          <span>Free delivery on orders above Rs.499</span>
          <span className="landing-ecom-sep">|</span>
          <Shield size={15} />
          <span>100% Genuine Products</span>
          <span className="landing-ecom-sep">|</span>
          <Award size={15} />
          <span>Earn Loyalty Points</span>
        </div>

        {/* Store Header Bar */}
        <div className="landing-ecom-header">
          <div className="landing-ecom-logo">
            <ShoppingBag size={24} />
            <span>SmartSalon <strong>Store</strong></span>
          </div>
          <div className="landing-ecom-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search beauty products, brands..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />
          </div>
          <div className="landing-ecom-header-right">
            <Link to="/login" className="landing-ecom-login-btn">
              <ShoppingCart size={18} /> Login to Buy
            </Link>
          </div>
        </div>

        {/* Gender Tabs + Sort + View */}
        <div className="landing-ecom-tabs">
          <div className="landing-ecom-tabs-left">
            {[
              { val: "", label: "All Products" },
              { val: "men", label: "Men" },
              { val: "women", label: "Women" },
              { val: "unisex", label: "Unisex" },
            ].map(({ val, label }) => (
              <button
                key={val}
                className={`landing-ecom-tab ${storeGender === val ? "active" : ""}`}
                onClick={() => setStoreGender(val)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="landing-ecom-tabs-right">
            <select value={storeSortBy} onChange={(e) => setStoreSortBy(e.target.value)} className="landing-ecom-sort">
              <option value="popular">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <button className={`landing-ecom-view-btn ${storeViewMode === "grid" ? "active" : ""}`} onClick={() => setStoreViewMode("grid")}><Grid3X3 size={15} /></button>
            <button className={`landing-ecom-view-btn ${storeViewMode === "list" ? "active" : ""}`} onClick={() => setStoreViewMode("list")}><List size={15} /></button>
          </div>
        </div>

        {/* Results Count */}
        <div className="landing-ecom-results">
          Showing <strong>{filteredStoreProducts.length}</strong> of {storeProducts.length} products
        </div>

        {/* Product Grid */}
        {storeLoading ? (
          <div className="loading-center" style={{ padding: "3rem" }}><span className="spinner" /></div>
        ) : filteredStoreProducts.length === 0 ? (
          <div className="empty-state" style={{ padding: "3rem" }}>
            <ShoppingBag size={48} />
            <h3>No products found</h3>
            <p>Try a different search or filter</p>
          </div>
        ) : (
          <div className={`landing-ecom-grid ${storeViewMode}`}>
            {filteredStoreProducts.map((product) => {
              const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
              const isWished = storeWishlist.includes(product.id);
              return (
                <div key={product.id} className={`landing-ecom-card ${storeViewMode}`}>
                  <div className="landing-ecom-card-img">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="landing-ecom-card-placeholder"><ShoppingBag size={storeViewMode === "list" ? 28 : 40} /></div>
                    )}
                    {discount > 0 && <span className="landing-ecom-discount">{discount}% OFF</span>}
                    <button
                      className={`landing-ecom-wish ${isWished ? "active" : ""}`}
                      onClick={() => setStoreWishlist(prev => prev.includes(product.id) ? prev.filter(x => x !== product.id) : [...prev, product.id])}
                    >
                      <Heart size={15} fill={isWished ? "#ef4444" : "none"} />
                    </button>
                    <span className={`landing-ecom-gender-tag ${product.gender}`}>{product.gender}</span>
                  </div>
                  <div className="landing-ecom-card-body">
                    <span className="landing-ecom-brand">{product.brand}</span>
                    <h3 className="landing-ecom-name">{product.name}</h3>
                    <p className="landing-ecom-desc">{product.description}</p>
                    <div className="landing-ecom-rating-row">
                      <span className="landing-ecom-rating-badge">
                        {product.rating.toFixed(1)} <Star size={10} fill="white" stroke="white" />
                      </span>
                      <span className="landing-ecom-reviews">({product.total_reviews})</span>
                    </div>
                    <div className="landing-ecom-price-row">
                      <span className="landing-ecom-price">Rs.{product.discount_price || product.price}</span>
                      {product.discount_price && (
                        <>
                          <span className="landing-ecom-mrp">Rs.{product.price}</span>
                          <span className="landing-ecom-off">{discount}% off</span>
                        </>
                      )}
                    </div>
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="landing-ecom-low-stock">Only {product.stock} left - Hurry!</span>
                    )}
                    <div className="landing-ecom-delivery">
                      <Truck size={12} /> Free delivery above Rs.499
                    </div>
                    <div className="landing-ecom-actions">
                      <Link to="/login" className="landing-ecom-cart-btn">
                        <ShoppingCart size={14} /> Add to Cart
                      </Link>
                      <Link to="/login" className="landing-ecom-buy-btn">
                        <Zap size={14} /> Buy Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Login CTA */}
        <div className="landing-ecom-cta">
          <p>Login to add products to cart, purchase, and track orders</p>
          <div className="landing-ecom-cta-btns">
            <Link to="/login" className="btn btn-primary btn-lg">
              <ShoppingCart size={18} /> Login to Purchase <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              <ShoppingBag size={18} /> Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="landing-section">
        <div className="landing-section-header">
          <div className="landing-section-badge"><Heart size={14} /> Testimonials</div>
          <h2>What Our<span className="landing-gradient-text"> Clients Say</span></h2>
          <p>Join thousands of happy customers</p>
        </div>
        <div className="landing-testimonials-grid">
          <Testimonial name="Arjun Nair" role="Regular Customer, Kochi" text="The AI hairstyle preview is amazing! I could see exactly how I'd look before getting my haircut. Best salon experience ever." rating={5} delay={0} />
          <Testimonial name="Meera Krishnan" role="Loyal Member, Thrissur" text="Love the loyalty points system! The booking is so smooth and I always know my queue position. No more waiting." rating={5} delay={100} />
          <Testimonial name="Sreelakshmi Menon" role="New Customer, Kozhikode" text="Switching from my old salon was the best decision. The AI preview feature sold me — and the stylists are top notch." rating={5} delay={200} />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2>Ready to Transform Your<br /><span className="landing-gradient-text">Salon Experience?</span></h2>
          <p>Join SmartSalon today and discover the future of grooming</p>
          <div className="landing-cta-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/booking" className="btn btn-outline-white btn-lg">
              <Calendar size={18} /> Book Now
            </Link>
            <Link to="/store" className="btn btn-outline-white btn-lg">
              <ShoppingBag size={18} /> Shop Products
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <div className="landing-footer-logo">
              <Scissors size={22} /> SmartSalon
            </div>
            <p>AI-powered salon booking platform for the modern world. Smart scheduling, hairstyle previews, and seamless experiences.</p>
            <div className="landing-footer-social">
              <a href="#"><Instagram size={18} /></a>
              <a href="#"><Facebook size={18} /></a>
              <a href="#"><Twitter size={18} /></a>
              <a href="#"><Youtube size={18} /></a>
            </div>
          </div>
          <div className="landing-footer-col">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#ai-preview">AI Preview</a>
            <a href="#testimonials">Reviews</a>
            <Link to="/store">Beauty Store</Link>
            <Link to="/salons">Kerala Salons</Link>
          </div>
          <div className="landing-footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Press</a>
          </div>
          <div className="landing-footer-col">
            <h4>Contact</h4>
            <a href="#"><Mail size={14} /> info@smartsalon.in</a>
            <a href="#"><Phone size={14} /> +91 484 123 4567</a>
            <a href="#"><MapPin size={14} /> Kochi, Kerala</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; 2026 SmartSalon. All rights reserved.</p>
          <div className="landing-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
