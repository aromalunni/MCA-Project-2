import React from "react";
import { Clock, CheckCircle2, Tag } from "lucide-react";

export default function ServiceCard({ service, selected, onSelect }) {
  const hasDiscount = service.discounted_price != null && service.discounted_price < service.price;

  const getServiceImage = (name) => {
    const images = {
      "Haircut & Styling": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600",
      "Keratin Treatment": "https://images.unsplash.com/photo-1516975080661-46bfa2c281c7?auto=format&fit=crop&q=80&w=600",
      "Hair Coloring": "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=600",
      "Beard Trim": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600",
      "Classic Shave": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600",
      "Facial Cleanup": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600",
      "Anti-Acne Treatment": "https://images.unsplash.com/photo-1616853509923-1d0e51532bd7?auto=format&fit=crop&q=80&w=600",
      "Aromatherapy Massage": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=600",
      "Deep Tissue Massage": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
      "Bridal Makeup": "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&q=80&w=600"
    };
    return images[name] || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600";
  };

  return (
    <div
      className={`up-service-card has-image ${selected ? "selected" : ""}`}
      onClick={() => onSelect(service)}
    >
      <div className="up-service-image-wrapper">
        <img src={getServiceImage(service.name)} alt={service.name} />
        {hasDiscount && (
          <div className="up-service-discount-badge">
            <Tag size={12} style={{ marginRight: "4px" }} />
            {service.discount_type === "percentage"
              ? `${service.discount_value}% OFF`
              : `Rs.${service.discount_value} OFF`}
          </div>
        )}
      </div>
      
      <div className="up-service-content">
        <h3>{service.name}</h3>
        {service.description && (
          <p className="up-service-desc">{service.description}</p>
        )}
        <div className="up-service-footer">
          <div className="up-service-price-row" style={{ marginBottom: 0 }}>
            {hasDiscount ? (
              <>
                <span className="up-service-price discounted" style={{ fontSize: "1.35rem" }}>Rs.{service.discounted_price}</span>
                <span className="up-service-price-old">Rs.{service.price}</span>
              </>
            ) : (
              <span className="up-service-price" style={{ fontSize: "1.35rem" }}>Rs.{service.price}</span>
            )}
          </div>
          <div className="up-service-duration"><Clock size={13} style={{ marginRight: "4px" }} /> {service.duration_minutes} min</div>
        </div>
      </div>
      
      {selected && (
        <div className="up-service-selected"><CheckCircle2 size={16} /></div>
      )}
    </div>
  );
}
