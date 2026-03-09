import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productsAPI, cartAPI } from "../services/api";
import {
  ShoppingBag, Search, Filter, Star, ShoppingCart,
  Heart, Package, Tag, ChevronDown, Zap, Truck,
  Shield, Award, ArrowRight, X, Grid3X3, List, SlidersHorizontal, Eye,
  Scissors, Smile, Sparkle, Droplets, Paintbrush, Sparkles
} from "lucide-react";

export default function Store() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: "", gender: "", search: "", brand: "",
    min_price: "", max_price: "",
  });
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("popular");
  const [wishlist, setWishlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes, cartRes] = await Promise.all([
        productsAPI.list({}),
        productsAPI.categories(),
        cartAPI.list().catch(() => ({ data: [] })),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setCartCount(cartRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.gender) params.gender = filters.gender;
      if (filters.search) params.search = filters.search;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      const res = await productsAPI.list(params);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const addToCart = async (productId) => {
    setAddingToCart(productId);
    try {
      await cartAPI.add({ product_id: productId, quantity: 1 });
      setCartCount((c) => c + 1);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];

  const getCatIcon = (name) => {
    const map = {
      "Hair Care": Scissors,
      "Skin Care": Sparkles,
      "Beard & Grooming": Smile,
      "Makeup": Paintbrush,
      "Fragrances": Droplets,
      "Tools & Accessories": Zap
    };
    const Icon = map[name] || Zap;
    return <Icon size={14} style={{ marginRight: '6px' }} />;
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return (a.discount_price || a.price) - (b.discount_price || b.price);
    if (sortBy === "price-high") return (b.discount_price || b.price) - (a.discount_price || a.price);
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest") return b.id - a.id;
    return b.total_reviews - a.total_reviews;
  });

  return (
    <div className="ecom-store">
      {/* Top Banner */}
      <div className="ecom-banner">
        <div className="ecom-banner-content">
          <Zap size={20} />
          <span>Free delivery on orders above Rs.499</span>
          <span className="ecom-banner-sep">|</span>
          <Shield size={16} />
          <span>100% Genuine Products</span>
          <span className="ecom-banner-sep">|</span>
          <Award size={16} />
          <span>Earn Loyalty Points on every purchase</span>
        </div>
      </div>

      {/* Search Header */}
      <div className="ecom-search-header">
        <div className="ecom-logo" onClick={() => navigate("/store")}>
          <ShoppingBag size={24} />
          <span>SmartSalon <strong>Store</strong></span>
        </div>
        <form className="ecom-search-bar" onSubmit={handleSearch}>
          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            className="ecom-search-cat"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search for beauty products, brands and more..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <button type="submit"><Search size={20} /></button>
        </form>
        <div className="ecom-header-actions">
          <button className="ecom-cart-btn" onClick={() => navigate("/cart")}>
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="ecom-cart-count">{cartCount}</span>}
            <span className="ecom-cart-label">Cart</span>
          </button>
          <button className="ecom-orders-btn" onClick={() => navigate("/orders")}>
            <Package size={20} />
            <span>Orders</span>
          </button>
        </div>
      </div>

      {/* Gender Quick Tabs */}
      <div className="ecom-gender-tabs">
        {[
          { val: "", label: "All Products", count: products.length },
          { val: "men", label: "Men" },
          { val: "women", label: "Women" },
          { val: "unisex", label: "Unisex" },
        ].map(({ val, label }) => (
          <button
            key={val}
            className={`ecom-gender-tab ${filters.gender === val ? "active" : ""}`}
            onClick={() => { setFilters({ ...filters, gender: val }); setTimeout(applyFilters, 0); }}
          >
            {label}
          </button>
        ))}
        <div className="ecom-gender-tabs-right">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="ecom-sort-select">
            <option value="popular">Sort: Popularity</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
          <button className={`ecom-view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}><Grid3X3 size={16} /></button>
          <button className={`ecom-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}><List size={16} /></button>
        </div>
      </div>

      <div className="ecom-body">
        {/* Sidebar Filters */}
        <aside className={`ecom-sidebar ${showFilters ? "" : "hidden"}`}>
          <div className="ecom-sidebar-header">
            <h3><SlidersHorizontal size={16} /> Filters</h3>
            <button onClick={() => {
              setFilters({ category_id: "", gender: "", search: "", brand: "", min_price: "", max_price: "" });
              loadData();
            }}>Clear All</button>
          </div>

          <div className="ecom-filter-section">
            <h4>Category</h4>
            <div className="ecom-filter-options">
              <label className={`ecom-filter-option ${!filters.category_id ? "active" : ""}`}>
                <input type="radio" name="cat" checked={!filters.category_id}
                  onChange={() => { setFilters({ ...filters, category_id: "" }); setTimeout(applyFilters, 0); }} />
                <span>All Categories</span>
              </label>
              {categories.map((c) => (
                <label key={c.id} className={`ecom-filter-option ${filters.category_id === String(c.id) ? "active" : ""}`}>
                  <input type="radio" name="cat" checked={filters.category_id === String(c.id)}
                    onChange={() => { setFilters({ ...filters, category_id: String(c.id) }); setTimeout(applyFilters, 0); }} />
                  <span>{getCatIcon(c.name)} {c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ecom-filter-section">
            <h4>Price Range</h4>
            <div className="ecom-price-inputs">
              <input type="number" placeholder="Min" value={filters.min_price}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} />
              <span>to</span>
              <input type="number" placeholder="Max" value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%", marginTop: "0.5rem" }} onClick={applyFilters}>Apply</button>
          </div>

          <div className="ecom-filter-section">
            <h4>Brand</h4>
            <div className="ecom-filter-options scrollable">
              <label className={`ecom-filter-option ${!filters.brand ? "active" : ""}`}>
                <input type="radio" name="brand" checked={!filters.brand}
                  onChange={() => { setFilters({ ...filters, brand: "" }); setTimeout(applyFilters, 0); }} />
                <span>All Brands</span>
              </label>
              {brands.map((b) => (
                <label key={b} className={`ecom-filter-option ${filters.brand === b ? "active" : ""}`}>
                  <input type="radio" name="brand" checked={filters.brand === b}
                    onChange={() => { setFilters({ ...filters, brand: b }); setTimeout(applyFilters, 0); }} />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="ecom-products-area">
          <div className="ecom-results-bar">
            <span>Showing <strong>{sortedProducts.length}</strong> products</span>
            <button className="ecom-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} /> {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          {loading ? (
            <div className="loading-center"><span className="spinner" /></div>
          ) : sortedProducts.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={`ecom-grid ${viewMode}`}>
              {sortedProducts.map((product) => {
                const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
                const isWishlisted = wishlist.includes(product.id);
                return (
                  <div key={product.id} className={`ecom-product-card ${viewMode}`}>
                    <div className="ecom-product-image">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <div className="ecom-product-placeholder">
                          <ShoppingBag size={viewMode === "list" ? 28 : 40} />
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="ecom-discount-tag">{discount}% OFF</div>
                      )}
                      <button
                        className={`ecom-wishlist-btn ${isWishlisted ? "active" : ""}`}
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart size={16} fill={isWishlisted ? "#ef4444" : "none"} />
                      </button>
                      <span className={`ecom-gender-tag ${product.gender}`}>{product.gender}</span>
                    </div>
                    <div className="ecom-product-details">
                      <span className="ecom-product-brand">{product.brand}</span>
                      <h3 className="ecom-product-name">{product.name}</h3>
                      <p className="ecom-product-desc">{product.description}</p>
                      <div className="ecom-product-rating">
                        <span className="ecom-rating-badge">
                          {product.rating.toFixed(1)} <Star size={10} fill="white" stroke="white" />
                        </span>
                        <span className="ecom-rating-count">({product.total_reviews} reviews)</span>
                      </div>
                      <div className="ecom-product-pricing">
                        <span className="ecom-price-main">
                          Rs.{product.discount_price || product.price}
                        </span>
                        {product.discount_price && (
                          <>
                            <span className="ecom-price-mrp">Rs.{product.price}</span>
                            <span className="ecom-price-off">{discount}% off</span>
                          </>
                        )}
                      </div>
                      {product.stock > 0 && product.stock <= 5 && (
                        <span className="ecom-stock-warning">Only {product.stock} left - Hurry!</span>
                      )}
                      <div className="ecom-delivery-info">
                        <Truck size={12} /> Free delivery above Rs.499
                      </div>
                      <div className="ecom-product-actions">
                        <button className="ecom-buy-now" style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => setSelectedProduct(product)}>
                          <Eye size={14} /> View Details
                        </button>
                        <button
                          className="ecom-add-cart"
                          style={{ flex: 1 }}
                          onClick={() => addToCart(product.id)}
                          disabled={addingToCart === product.id || product.stock === 0}
                        >
                          {product.stock === 0 ? "Out of Stock" :
                            addingToCart === product.id ? (
                              <span className="spinner" style={{ width: "1rem", height: "1rem" }} />
                            ) : (
                              <><ShoppingCart size={14} /> Add</>
                            )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Item Preview Modal */}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', maxWidth: '800px', width: '100%', display: 'flex', overflow: 'hidden', position: 'relative', animation: 'fadeInScale 0.3s ease-out', maxHeight: '90vh' }}>
            <button onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
              <X size={18} />
            </button>
            <div style={{ flex: '1', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />
              ) : (
                <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0', borderRadius: '8px' }}>
                  <ShoppingBag size={64} color="#94a3b8" />
                </div>
              )}
            </div>
            <div style={{ flex: '1', padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <span className="ecom-product-brand" style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedProduct.brand}</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '1rem', color: 'var(--text)' }}>{selectedProduct.name}</h2>
              <div className="ecom-product-rating" style={{ marginBottom: '1rem' }}>
                <span className="ecom-rating-badge" style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {selectedProduct.rating.toFixed(1)} <Star size={12} fill="white" stroke="white" />
                </span>
                <span className="ecom-rating-count" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>({selectedProduct.total_reviews} reviews)</span>
              </div>
              <div className="ecom-product-pricing" style={{ marginBottom: '1.5rem' }}>
                <span className="ecom-price-main" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)' }}>
                  Rs.{selectedProduct.discount_price || selectedProduct.price}
                </span>
                {selectedProduct.discount_price && (
                  <>
                    <span className="ecom-price-mrp" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: '0.75rem', fontSize: '1.1rem' }}>Rs.{selectedProduct.price}</span>
                    <span className="ecom-price-off" style={{ color: 'var(--success)', fontWeight: '700', marginLeft: '0.75rem', fontSize: '1rem' }}>{Math.round(((selectedProduct.price - selectedProduct.discount_price) / selectedProduct.price) * 100)}% off</span>
                  </>
                )}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text)' }}>Product Details</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{selectedProduct.description}</p>
              </div>
              <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Truck size={16} color="var(--primary)" /> <span>Free delivery above Rs.499</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Shield size={16} color="var(--success)" /> <span>100% Genuine Product</span>
                </div>
              </div>
              <div className="ecom-product-actions" style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  onClick={() => { addToCart(selectedProduct.id); setSelectedProduct(null); navigate("/cart"); }}
                >
                  <Zap size={18} /> Buy Now
                </button>
                <button
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  onClick={() => addToCart(selectedProduct.id)}
                  disabled={addingToCart === selectedProduct.id || selectedProduct.stock === 0}
                >
                  {addingToCart === selectedProduct.id ? <span className="spinner" style={{ width: "1.2rem", height: "1.2rem", borderWidth: "2px" }} /> : <><ShoppingCart size={18} /> Add to Cart</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
