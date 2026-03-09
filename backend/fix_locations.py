"""
Fix Locations — Remove old/duplicate entries and set the correct 8 Kerala locations.
Run from the backend directory: python fix_locations.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import time
from app.core.database import SessionLocal
from app.models import Location

# The correct 8 Kerala salon locations
CORRECT_LOCATIONS = [
    {
        "name": "SmartSalon - MG Road Kochi",
        "address": "42 MG Road, Near Lulu Mall",
        "city": "Kochi",
        "district": "Ernakulam",
        "state": "Kerala",
        "phone": "+91 484 123 4567",
        "latitude": 9.9312,
        "longitude": 76.2673,
        "rating": 4.8,
        "opening_time": time(9, 0),
        "closing_time": time(21, 0),
    },
    {
        "name": "SmartSalon - Technopark",
        "address": "Technopark Campus, Kazhakkoottam",
        "city": "Thiruvananthapuram",
        "district": "Thiruvananthapuram",
        "state": "Kerala",
        "phone": "+91 471 234 5678",
        "latitude": 8.5568,
        "longitude": 76.8812,
        "rating": 4.7,
        "opening_time": time(9, 0),
        "closing_time": time(20, 0),
    },
    {
        "name": "SmartSalon - Calicut Beach",
        "address": "Beach Road, Near SM Street",
        "city": "Kozhikode",
        "district": "Kozhikode",
        "state": "Kerala",
        "phone": "+91 495 345 6789",
        "latitude": 11.2588,
        "longitude": 75.7804,
        "rating": 4.6,
        "opening_time": time(9, 30),
        "closing_time": time(20, 30),
    },
    {
        "name": "SmartSalon - Thrissur Round",
        "address": "Near Vadakkunnathan Temple, Swaraj Round",
        "city": "Thrissur",
        "district": "Thrissur",
        "state": "Kerala",
        "phone": "+91 487 456 7890",
        "latitude": 10.5276,
        "longitude": 76.2144,
        "rating": 4.5,
        "opening_time": time(9, 0),
        "closing_time": time(21, 0),
    },
    {
        "name": "SmartSalon - Kollam Beach",
        "address": "Beach Road, Kollam",
        "city": "Kollam",
        "district": "Kollam",
        "state": "Kerala",
        "phone": "+91 474 567 8901",
        "latitude": 8.8932,
        "longitude": 76.6141,
        "rating": 4.4,
        "opening_time": time(10, 0),
        "closing_time": time(20, 0),
    },
    {
        "name": "SmartSalon - Kottayam",
        "address": "KK Road, Near Nagampadam",
        "city": "Kottayam",
        "district": "Kottayam",
        "state": "Kerala",
        "phone": "+91 481 678 9012",
        "latitude": 9.5916,
        "longitude": 76.5222,
        "rating": 4.5,
        "opening_time": time(9, 0),
        "closing_time": time(20, 0),
    },
    {
        "name": "SmartSalon - Alappuzha",
        "address": "Near Alappuzha Beach, NH66",
        "city": "Alappuzha",
        "district": "Alappuzha",
        "state": "Kerala",
        "phone": "+91 477 789 0123",
        "latitude": 9.4981,
        "longitude": 76.3388,
        "rating": 4.3,
        "opening_time": time(9, 30),
        "closing_time": time(20, 0),
    },
    {
        "name": "SmartSalon - Kannur City",
        "address": "Fort Road, Near St. Angelo Fort",
        "city": "Kannur",
        "district": "Kannur",
        "state": "Kerala",
        "phone": "+91 497 890 1234",
        "latitude": 11.8745,
        "longitude": 75.3704,
        "rating": 4.6,
        "opening_time": time(9, 0),
        "closing_time": time(20, 30),
    },
]

CORRECT_NAMES = {loc["name"] for loc in CORRECT_LOCATIONS}


def fix_locations():
    db = SessionLocal()
    try:
        # 1. Fetch all existing locations
        all_locs = db.query(Location).all()
        print(f"\n📍 Found {len(all_locs)} existing location(s)")

        # 2. Delete any that are NOT in the correct list
        deleted = 0
        for loc in all_locs:
            if loc.name not in CORRECT_NAMES:
                print(f"  ❌ Removing old location: {loc.name}")
                db.delete(loc)
                deleted += 1

        if deleted:
            db.flush()
            print(f"  🗑  Removed {deleted} old location(s)")

        # 3. Add missing correct locations / update existing ones
        for data in CORRECT_LOCATIONS:
            existing = db.query(Location).filter(Location.name == data["name"]).first()
            if existing:
                # Update fields to make sure they're correct
                for k, v in data.items():
                    setattr(existing, k, v)
                existing.is_active = True
                print(f"  ✅ Updated: {data['name']}")
            else:
                loc = Location(**data, is_active=True)
                db.add(loc)
                print(f"  ➕ Added:   {data['name']}")

        db.commit()
        print(f"\n✅ Done! {len(CORRECT_LOCATIONS)} correct Kerala locations are now in the database.\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_locations()
