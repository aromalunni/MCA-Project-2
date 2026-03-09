"""
Seed script — populates the database with:
- Users (admin + Sandra)
- Kerala salon locations
- Services, categories, staff
- Beauty products
- Cancellation policies, discounts

Run: python seed.py
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import time, date, timedelta
from app.core.database import SessionLocal, engine, Base
from app.models import (
    User, Service, Staff, ServiceCategory, Location, CancellationPolicy,
    Discount, ProductCategory, Product,
)
from app.models.enums import DiscountType, ProductGender
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ─── Admin user ───
    if not db.query(User).filter(User.email == "admin@smartsalon.com").first():
        admin = User(
            name="admin",
            email="admin@smartsalon.com",
            hashed_password=hash_password("admin"),
            is_admin=True,
        )
        db.add(admin)
        print("✓ Admin created: admin / admin")

    # ─── Regular user: Sandra ───
    if not db.query(User).filter(User.email == "sandra@smartsalon.com").first():
        sandra = User(
            name="Sandra",
            email="sandra@smartsalon.com",
            phone="+91 98765 43210",
            hashed_password=hash_password("admin"),
            is_admin=False,
            loyalty_points=150,
        )
        db.add(sandra)
        print("✓ User created: Sandra / admin")

    # More Kerala users
    extra_users = [
        ("Arjun Nair", "arjun@smartsalon.com", "+91 94567 12345", 200),
        ("Meera Krishnan", "meera@smartsalon.com", "+91 98234 56789", 320),
        ("Vishnu Pillai", "vishnu@smartsalon.com", "+91 97456 78901", 75),
        ("Sreelakshmi Menon", "sreelakshmi@smartsalon.com", "+91 94123 45678", 450),
        ("Amal Thomas", "amal@smartsalon.com", "+91 98765 11111", 100),
    ]
    for uname, uemail, uphone, uloyalty in extra_users:
        if not db.query(User).filter(User.email == uemail).first():
            db.add(User(
                name=uname, email=uemail, phone=uphone,
                hashed_password=hash_password("admin"),
                is_admin=False, loyalty_points=uloyalty,
            ))
            print(f"✓ User created: {uname} / admin")

    # ─── Kerala Salon Locations ───
    loc_data = [
        ("SmartSalon - MG Road Kochi", "42 MG Road, Near Lulu Mall", "Kochi", "Ernakulam", "Kerala",
         "+91 484 123 4567", 9.9312, 76.2673, 4.8, time(9, 0), time(21, 0)),
        ("SmartSalon - Technopark", "Technopark Campus, Kazhakkoottam", "Thiruvananthapuram", "Thiruvananthapuram", "Kerala",
         "+91 471 234 5678", 8.5568, 76.8812, 4.7, time(9, 0), time(20, 0)),
        ("SmartSalon - Calicut Beach", "Beach Road, Near SM Street", "Kozhikode", "Kozhikode", "Kerala",
         "+91 495 345 6789", 11.2588, 75.7804, 4.6, time(9, 30), time(20, 30)),
        ("SmartSalon - Thrissur Round", "Near Vadakkunnathan Temple, Swaraj Round", "Thrissur", "Thrissur", "Kerala",
         "+91 487 456 7890", 10.5276, 76.2144, 4.5, time(9, 0), time(21, 0)),
        ("SmartSalon - Kollam Beach", "Beach Road, Kollam", "Kollam", "Kollam", "Kerala",
         "+91 474 567 8901", 8.8932, 76.6141, 4.4, time(10, 0), time(20, 0)),
        ("SmartSalon - Kottayam", "KK Road, Near Nagampadam", "Kottayam", "Kottayam", "Kerala",
         "+91 481 678 9012", 9.5916, 76.5222, 4.5, time(9, 0), time(20, 0)),
        ("SmartSalon - Alappuzha", "Near Alappuzha Beach, NH66", "Alappuzha", "Alappuzha", "Kerala",
         "+91 477 789 0123", 9.4981, 76.3388, 4.3, time(9, 30), time(20, 0)),
        ("SmartSalon - Kannur City", "Fort Road, Near St. Angelo Fort", "Kannur", "Kannur", "Kerala",
         "+91 497 890 1234", 11.8745, 75.3704, 4.6, time(9, 0), time(20, 30)),
    ]
    locations = {}
    for name, addr, city, district, state, phone, lat, lng, rating, ot, ct in loc_data:
        existing = db.query(Location).filter(Location.name == name).first()
        if not existing:
            loc = Location(
                name=name, address=addr, city=city, district=district, state=state,
                phone=phone, latitude=lat, longitude=lng, rating=rating,
                opening_time=ot, closing_time=ct,
            )
            db.add(loc)
            db.flush()
            locations[name] = loc.id
            print(f"✓ Location: {name}")
        else:
            locations[name] = existing.id

    # ─── Service Categories ───
    cat_data = [
        ("Hair", "Haircut, colour, styling", ""),
        ("Beard & Grooming", "Beard trim and grooming", ""),
        ("Skin Care", "Facials and skin treatments", ""),
        ("Spa", "Relaxation and spa treatments", ""),
        ("Nails", "Manicure and pedicure", ""),
        ("Bridal", "Bridal makeup and packages", ""),
    ]
    categories = {}
    for name, desc, icon in cat_data:
        existing = db.query(ServiceCategory).filter(ServiceCategory.name == name).first()
        if not existing:
            cat = ServiceCategory(name=name, description=desc, icon=icon)
            db.add(cat)
            db.flush()
            categories[name] = cat.id
            print(f"✓ Category: {icon} {name}")
        else:
            categories[name] = existing.id
            existing.icon = icon

    # ─── Services ───
    loc1 = locations.get("SmartSalon - MG Road Kochi")
    services_data = [
        ("Haircut", "Classic haircut and styling", 30, 299, "Hair", loc1),
        ("Hair Colour", "Full hair colouring service", 90, 1499, "Hair", loc1),
        ("Beard Trim", "Clean beard shaping and trim", 20, 149, "Beard & Grooming", loc1),
        ("Facial", "Deep cleansing facial treatment", 45, 799, "Skin Care", loc1),
        ("Hair Spa", "Nourishing hair spa treatment", 60, 999, "Spa", loc1),
        ("Manicure", "Nail cleaning and polishing", 40, 499, "Nails", loc1),
        ("Bridal Makeup", "Complete bridal look with styling", 180, 4999, "Bridal", loc1),
        ("Hair Straightening", "Keratin hair straightening treatment", 120, 2999, "Hair", loc1),
        ("Pedicure", "Foot care and nail polishing", 45, 599, "Nails", loc1),
        ("De-Tan Treatment", "Full body de-tan facial", 60, 899, "Skin Care", loc1),
    ]
    for name, desc, duration, price, cat_name, lid in services_data:
        if not db.query(Service).filter(Service.name == name).first():
            db.add(Service(
                name=name, description=desc, duration_minutes=duration,
                price=price, category_id=categories.get(cat_name), location_id=lid,
            ))
            print(f"✓ Service: {name}")

    # ─── Staff ───
    staff_data = [
        ("Rajesh Menon", "Hair Expert", 5, time(9, 0), time(18, 0), loc1),
        ("Priya Nair", "Colour Specialist", 7, time(10, 0), time(19, 0), loc1),
        ("Arun Kumar", "Beard & Grooming", 3, time(9, 0), time(17, 0), loc1),
        ("Divya Pillai", "Skin & Facial Expert", 6, time(11, 0), time(20, 0), loc1),
        ("Lakshmi Devi", "Bridal Specialist", 10, time(9, 0), time(19, 0), loc1),
        ("Vishnu Prasad", "Hair Stylist", 4, time(10, 0), time(19, 0), loc1),
        ("Anjali Krishnan", "Spa Therapist", 5, time(9, 0), time(18, 0), loc1),
        ("Suresh Babu", "Grooming Expert", 8, time(9, 0), time(18, 0), loc1),
        ("Deepa Mohan", "Nail Art Specialist", 4, time(9, 0), time(18, 0), loc1),
        ("Sreekanth Varma", "Senior Hair Stylist", 12, time(9, 0), time(19, 0), loc1),
    ]
    for name, spec, exp, ws, we, lid in staff_data:
        if not db.query(Staff).filter(Staff.name == name).first():
            db.add(Staff(name=name, specialization=spec, experience_years=exp, work_start=ws, work_end=we, location_id=lid))
            print(f"✓ Staff: {name}")

    # ─── Cancellation Policies ───
    policy_data = [
        ("Free Cancellation", 24, 100, 0),
        ("Late Cancellation", 6, 75, 50),
        ("Last Minute", 1, 50, 100),
    ]
    for name, hours, refund, penalty in policy_data:
        if not db.query(CancellationPolicy).filter(CancellationPolicy.name == name).first():
            db.add(CancellationPolicy(name=name, hours_before=hours, refund_percent=refund, penalty_amount=penalty))
            print(f"✓ Policy: {name}")

    db.flush()

    # ─── Discounts ───
    today = date.today()
    discount_data = [
        ("Haircut", DiscountType.percentage, 20, today, today + timedelta(days=30)),
        ("Hair Spa", DiscountType.flat, 200, today, today + timedelta(days=15)),
        ("Bridal Makeup", DiscountType.percentage, 10, today, today + timedelta(days=60)),
    ]
    for svc_name, dtype, dval, sd, ed in discount_data:
        svc = db.query(Service).filter(Service.name == svc_name).first()
        if svc and not db.query(Discount).filter(Discount.service_id == svc.id, Discount.is_active == True).first():
            db.add(Discount(service_id=svc.id, discount_type=dtype, discount_value=dval, start_date=sd, end_date=ed))
            print(f"✓ Discount: {dtype.value} {dval} on {svc_name}")

    # ─── Product Categories ───
    prod_cat_data = [
        ("Hair Care", "Shampoos, conditioners, serums", ""),
        ("Skin Care", "Cleansers, moisturizers, sunscreen", ""),
        ("Beard & Grooming", "Oils, balms, trimmers", ""),
        ("Makeup", "Foundation, lipstick, eye makeup", ""),
        ("Fragrances", "Perfumes and deodorants", ""),
        ("Tools & Accessories", "Brushes, combs, styling tools", ""),
    ]
    prod_categories = {}
    for name, desc, icon in prod_cat_data:
        existing = db.query(ProductCategory).filter(ProductCategory.name == name).first()
        if not existing:
            cat = ProductCategory(name=name, description=desc, icon=icon)
            db.add(cat)
            db.flush()
            prod_categories[name] = cat.id
            print(f"✓ Product Category: {icon} {name}")
        else:
            prod_categories[name] = existing.id
            existing.icon = icon

    # ─── Beauty Products ───
    products_data = [
        # Hair Care
        ("L'Oreal Paris Shampoo", "Damage repair shampoo 340ml", 449, 399, "Hair Care", ProductGender.unisex, "L'Oreal", 50, "https://images.unsplash.com/photo-1585652757140-59a117b9b187?auto=format&fit=crop&q=80&w=1000"),
        ("TRESemmé Conditioner", "Keratin smooth conditioner 190ml", 299, 249, "Hair Care", ProductGender.unisex, "TRESemmé", 40, "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&q=80&w=1000"),
        ("Matrix Hair Serum", "Biolage smoothing serum 100ml", 599, 499, "Hair Care", ProductGender.women, "Matrix", 30, "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1000"),
        ("Beardo Hair Growth Oil", "Natural hair growth oil 50ml", 499, 449, "Hair Care", ProductGender.men, "Beardo", 35, "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=1000"),
        ("Indulekha Bringha Oil", "Ayurvedic hair oil 100ml", 399, 349, "Hair Care", ProductGender.unisex, "Indulekha", 45, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000"),
        ("Streax Hair Color", "Highlight hair color cream", 199, None, "Hair Care", ProductGender.unisex, "Streax", 60, "https://images.unsplash.com/photo-1615397323184-18fa1d1ff3db?auto=format&fit=crop&q=80&w=1000"),
        # Skin Care
        ("Biotique Face Wash", "Honey gel face wash 150ml", 249, 199, "Skin Care", ProductGender.unisex, "Biotique", 55, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=1000"),
        ("Lotus Sunscreen SPF 50", "UV protection sunscreen 100g", 499, 449, "Skin Care", ProductGender.unisex, "Lotus", 40, "https://images.unsplash.com/photo-1616682944065-27694ff8e755?auto=format&fit=crop&q=80&w=1000"),
        ("Nivea Men Face Cream", "Dark spot reduction cream 50ml", 299, 249, "Skin Care", ProductGender.men, "Nivea", 50, "https://images.unsplash.com/photo-1611078519495-2bdfff2a2b72?auto=format&fit=crop&q=80&w=1000"),
        ("Lakme Moisturizer", "Peach milk moisturizer 200ml", 349, 299, "Skin Care", ProductGender.women, "Lakme", 35, "https://images.unsplash.com/photo-1608248593842-880c5c64c7ba?auto=format&fit=crop&q=80&w=1000"),
        ("Mamaearth Vitamin C Serum", "Brightening face serum 30ml", 599, 499, "Skin Care", ProductGender.unisex, "Mamaearth", 25, "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=1000"),
        ("Forest Essentials Face Mask", "Ayurvedic face mask 50g", 899, 799, "Skin Care", ProductGender.women, "Forest Essentials", 20, "https://images.unsplash.com/photo-1570194065650-d6023cbca54b?auto=format&fit=crop&q=80&w=1000"),
        # Beard & Grooming
        ("Beardo Beard Oil", "Natural beard growth oil 30ml", 399, 349, "Beard & Grooming", ProductGender.men, "Beardo", 45, "https://images.unsplash.com/photo-1626806787426-5910811b6325?auto=format&fit=crop&q=80&w=1000"),
        ("Bombay Shaving Razor", "Precision safety razor set", 699, 599, "Beard & Grooming", ProductGender.men, "Bombay Shaving", 30, "https://images.unsplash.com/photo-1582236170669-e02b8d54c1e4?auto=format&fit=crop&q=80&w=1000"),
        ("Ustraa Beard Wash", "Anti-itch beard wash 60ml", 249, 199, "Beard & Grooming", ProductGender.men, "Ustraa", 50, "https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=1000"),
        ("The Man Company Beard Balm", "Almond & thyme beard balm", 349, 299, "Beard & Grooming", ProductGender.men, "The Man Company", 40, "https://images.unsplash.com/photo-1547228104-e3bbce4db136?auto=format&fit=crop&q=80&w=1000"),
        # Makeup
        ("Maybelline Foundation", "Fit me matte foundation 30ml", 599, 499, "Makeup", ProductGender.women, "Maybelline", 35, "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1000"),
        ("MAC Lipstick", "Matte lipstick Ruby Woo", 1450, 1299, "Makeup", ProductGender.women, "MAC", 20, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1000"),
        ("Lakme Kajal", "Eyeconic kajal deep black", 249, 199, "Makeup", ProductGender.women, "Lakme", 60, "https://images.unsplash.com/photo-1512496115841-344cb8c1e27a?auto=format&fit=crop&q=80&w=1000"),
        ("Sugar Cosmetics Eyeliner", "Matte finish eyeliner", 399, 349, "Makeup", ProductGender.women, "Sugar", 40, "https://images.unsplash.com/photo-1631214503851-9f9fa21ef24a?auto=format&fit=crop&q=80&w=1000"),
        # Fragrances
        ("Fogg Body Spray", "Long-lasting fragrance 150ml", 199, 179, "Fragrances", ProductGender.men, "Fogg", 70, "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000"),
        ("Engage Women Perfume", "Floral fragrance 100ml", 299, 249, "Fragrances", ProductGender.women, "Engage", 50, "https://images.unsplash.com/photo-1523293111855-520e176b5fac?auto=format&fit=crop&q=80&w=1000"),
        ("Wild Stone Deo", "Ultra sensual deo 150ml", 249, 199, "Fragrances", ProductGender.men, "Wild Stone", 55, "https://images.unsplash.com/photo-1616604246830-ec38c4b14d24?auto=format&fit=crop&q=80&w=1000"),
        ("Skinn by Titan", "Premium perfume for women 50ml", 1499, 1299, "Fragrances", ProductGender.women, "Skinn", 25, "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?auto=format&fit=crop&q=80&w=1000"),
        # Tools
        ("Vega Hair Dryer", "Professional hair dryer 1800W", 1299, 999, "Tools & Accessories", ProductGender.unisex, "Vega", 20, "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=1000"),
        ("Philips Trimmer", "Multi-grooming kit 9-in-1", 1999, 1699, "Tools & Accessories", ProductGender.men, "Philips", 15, "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?auto=format&fit=crop&q=80&w=1000"),
        ("Kent Comb Set", "Handmade premium comb set", 499, 399, "Tools & Accessories", ProductGender.unisex, "Kent", 40, "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=1000"),
        ("Real Techniques Brush Set", "Professional makeup brush set", 899, 749, "Tools & Accessories", ProductGender.women, "Real Techniques", 25, "https://images.unsplash.com/photo-1512496115841-344cb8c1e27a?auto=format&fit=crop&q=80&w=1000"),
    ]
    for name, desc, price, disc_price, cat_name, gender, brand, stock, img_url in products_data:
        existing_product = db.query(Product).filter(Product.name == name).first()
        if not existing_product:
            db.add(Product(
                name=name, description=desc, price=price,
                discount_price=disc_price,
                category_id=prod_categories.get(cat_name),
                gender=gender, brand=brand, stock=stock,
                image_url=img_url,
            ))
            print(f"✓ Product (Added): {name}")
        else:
            existing_product.image_url = img_url
            print(f"✓ Product (Updated image_url): {name}")

    db.commit()
    print("\n✅ Seed complete!")
    print("\n📋 Login credentials:")
    print("   Admin:  admin / admin")
    print("   User:   Sandra / admin")
    print(f"\n📍 {len(loc_data)} Kerala salon locations")
    print(f"🛍️  {len(products_data)} beauty products")
    print(f"💇 {len(services_data)} salon services")
    print(f"👨‍💼 {len(staff_data)} staff members")
    print(f"👤 {len(extra_users) + 2} total users (admin + Sandra + {len(extra_users)} Kerala users)")

finally:
    db.close()
