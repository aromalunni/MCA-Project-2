import re
from pathlib import Path

file_path = Path("app/api/routes/chat.py")
content = file_path.read_text()

new_content = """\"\"\"Chatbot API — smart customer support with predefined responses.\"\"\"

import re
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import ChatMessage, User, Service, Location, Booking, BookingStatus
from app.schemas.schemas import ChatMessageCreate, ChatMessageOut

router = APIRouter(prefix="/chat", tags=["Chat"])

# Smart response patterns (English, Malayalam)
RESPONSES = {
    r"(hello|hi|hey|hai|namaskaram|നമസ്കാരം|ഹലോ|ഹായ്)": (
        "Welcome to SmartSalon! How can I help you today?\\nYou can ask about services, booking, locations, or loyalty points.",
        "സ്മാർട്ട് സലൂണിലേക്ക് സ്വാഗതം! നിങ്ങളെ ഞാൻ എങ്ങനെ സഹായിക്കാനാണ്?\\nനിങ്ങൾക്ക് സർവീസുകൾ, ബുക്കിംഗ്, ലൊക്കേഷനുകൾ അല്ലെങ്കിൽ ലോയൽറ്റി പോയിന്റുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കാം."
    ),
    r"(service|price|cost|how much|rate|seva|vila|സേവനങ്ങൾ|വില|വിലവിവരങ്ങൾ)": None,  # Dynamic
    r"(book|appointment|slot|schedule|bukk|appoint|buk|ബുക്കിംഗ്|ബുക്ക്)": (
        "To book an appointment:\\n1. Go to the 'Book' page\\n2. Choose a service\\n3. Select your preferred stylist\\n4. Pick a date and time slot\\n5. Confirm and pay!\\nYou can also reschedule or cancel from 'My Bookings'.",
        "ബുക്ക് ചെയ്യുന്നതിന്:\\n1. 'Book' പേജിലേക്ക് പോകുക\\n2. സേവനം തിരഞ്ഞെടുക്കുക\\n3. സ്റ്റൈലിസ്റ്റിനെ തിരഞ്ഞെടുക്കുക\\n4. സമയവും തീയതിയും തിരഞ്ഞെടുക്കുക\\n5. പണമടച്ചു ഉറപ്പാക്കുക!\\nനിങ്ങൾക്ക് 'My Bookings' ൽ നിന്ന് മാറ്റങ്ങൾ വരുത്താം."
    ),
    r"(location|branch|address|where|find|salon|locate|ethu|evide|സലൂൺ ലൊക്കേഷനുകൾ|എവിടെ|ലൊക്കേഷൻ|ലൊക്കേഷനുകൾ)": None,  # Dynamic
    r"(cancel|refund|reschedule|change|cancel cheyyuka|ക്യാൻസൽ)": (
        "Booking cancellation policy:\\n- 24 hrs before: 100% refund\\n- 6 hrs before: 75% refund\\n- Last minute: 50% refund\\nManage from 'My Bookings' page.",
        "കാൻസലേഷൻ വിവരങ്ങൾ:\\n- 24 മണിക്കൂർ മുമ്പ്: 100% റീഫണ്ട്\\n- 6 മണിക്കൂർ മുമ്പ്: 75% റീഫണ്ട്\\n- അവസാന നിമിഷം: 50% റീഫണ്ട്\\n'My Bookings' വഴി നിങ്ങൾക്ക് ഇത് ചെയ്യാം."
    ),
    r"(loyalty|point|reward|points|nff|ലോയൽറ്റി പോയിന്റുകൾ|പോയിന്റ്)": (
        "Loyalty Program:\\n- Earn 10 pts per Rs.100 spent\\n- 1 pt = Rs.0.50 discount\\n- Redeem during checkout\\nCheck balance on your Profile page!",
        "ലോയൽറ്റി പ്രോഗ്രാം:\\n- ചെലവാക്കുന്ന ഓരോ 100 രൂപയ്ക്കും 10 പോയിന്റ് ലഭിക്കും\\n- 1 പോയിന്റ് = 0.50 രൂപ കിഴിവ്\\n- പേമെന്റ് സമയത്ത് ഉപയോഗിക്കാം\\nബാലൻസ് പ്രൊഫൈൽ പേജിൽ പരിശോധിക്കുക!"
    ),
    r"(product|store|shop|buy|purchase|പ്രൊഡക്ട്|സ്റ്റോർ)": (
        "Visit our Beauty Store for premium products:\\n- Hair care, Skin care, Grooming kits\\n- Beauty accessories\\nFilter by gender, brand, and price!",
        "ഞങ്ങളുടെ ബ്യൂട്ടി സ്റ്റോർ സന്ദർശിക്കൂ:\\n- ഹെയർ കെയർ, സ്കിൻ കെയർ\\n- മറ്റ് ബ്യൂട്ടി ഉൽപ്പന്നങ്ങൾ\\nവില, ബ്രാൻഡ് എന്നിവ നോക്കി തിരഞ്ഞെടുക്കാം!"
    ),
    r"(track|order|delivery|shipping|ഓർഡർ ട്രാക്കിംഗ്|ട്രാക്ക്)": (
        "Track your orders:\\n1. Go to 'My Orders' page\\n2. Click 'Track' on your order\\n3. Use tracking ID for real-time updates",
        "ഓർഡർ ട്രാക്ക് ചെയ്യാൻ:\\n1. 'My Orders' പേജിൽ പോവുക\\n2. നിങ്ങളുടെ ഓർഡർ 'Track' ചെയ്യുക\\n3. തത്സമയ വിവരങ്ങൾക്ക് ട്രാക്കിംഗ് ഐഡി ഉപയോഗിക്കുക"
    ),
    r"(face|virtual|try|scan|beauty check|face analysis|മുഖം|ഫേസ്)": (
        "Try our AI Virtual Beauty Check:\\n1. Go to 'Face Analysis' page\\n2. Upload a photo or use camera\\n3. Get AI suggestions for hairstyles, skincare & color",
        "ഞങ്ങളുടെ വെർച്വൽ ബ്യൂട്ടി ചെക്ക്:\\n1. 'Face Analysis' പോവുക\\n2. ചിത്രം അപ്‌ലോഡ് ചെയ്യുക\\n3. എ.ഐ നിർദ്ദേശങ്ങൾ അറിയുക"
    ),
    r"(hour|timing|open|close|when|samayam|time|സമയം)": (
        "Salon timings:\\n- Mon-Sat: 9:00 AM - 9:00 PM\\n- Sunday: 10:00 AM - 7:00 PM\\nCheck specific branch timings on Salon Finder!",
        "സമയം:\\n- തിങ്കൾ-ശനി: 9:00 AM - 9:00 PM\\n- ഞായർ: 10:00 AM - 7:00 PM"
    ),
    r"(staff|stylist|barber|who|aarun|stylistum|സ്റ്റൈലിസ്റ്റ്)": None,  # Dynamic
    r"(thank|thanks|bye|goodbye|nandi|tnx|നന്ദി)": (
        "Thank you! Have a great day. Feel free to ask anything anytime!",
        "നന്ദി! ഒരു നല്ല ദിനം ആശംസിക്കുന്നു. എപ്പോൾ വേണമെങ്കിലും സഹായം ചോദിക്കാവുന്നതാണ്!"
    ),
    r"(help|support|issue|problem|complaint|സഹായം|പരാതി)": (
        "Here to help!\\n- Booking issues: Refresh the page\\n- Payment problems: Check payment method\\n- Account issues: Reset password from Profile\\nFor urgent help, call: +91 484 123 4567",
        "സഹായിക്കാൻ ഞങ്ങൾ തയ്യാറാണ്!\\n- അടിയന്തര സഹായത്തിന് വിളിക്കുക: +91 484 123 4567"
    ),
}


def get_smart_response(message: str, db: Session, user_id: int) -> str:
    # Check if Malayalam response was explicitly requested by frontend
    is_ml_req = "[Please reply in Malayalam language]" in message
    msg = re.sub(r"^\\[Please reply in \\w+ language\\]\\s*", "", message)
    msg = msg.lower().strip()
    is_ml = is_ml_req or bool(re.search(r"[\\u0D00-\\u0D7F]", msg))

    # Dynamic: services
    if re.search(r"(service|price|cost|how much|rate|seva|vila|സേവനങ്ങൾ|വില|വിലവിവരങ്ങൾ)", msg):
        services = db.query(Service).filter(Service.is_active == True).limit(6).all()
        if services:
            svc_list = "\\n".join([f"- {s.name}: Rs.{s.price:.0f} ({s.duration_minutes} min)" for s in services])
            return f"ഞങ്ങളുടെ പ്രധാന സേവനങ്ങൾ:\\n{svc_list}\\n\\nകൂടുതൽ വിവരങ്ങൾക്ക് ബുക്ക് പേജ് കാണുക!" if is_ml else f"Our popular services:\\n{svc_list}\\n\\nVisit the Book page to see all!"
        return "ഞങ്ങൾക്ക് പലവിധം സേവനങ്ങളുണ്ട്. ബുക്കിംഗ് പേജ് സന്ദർശിക്കൂ!" if is_ml else "We have a variety of services. Visit the Book page to explore!"

    # Dynamic: locations
    if re.search(r"(location|branch|address|where|find|salon|locate|evide|എവിടെ|ലൊക്കേഷൻ|സലൂൺ ലൊക്കേഷനുകൾ)", msg):
        locations = db.query(Location).filter(Location.is_active == True).all()
        if locations:
            seen = set()
            loc_lines = []
            for l in locations:
                key = l.name.strip()
                if key not in seen:
                    seen.add(key)
                    if l.city and l.city.lower() not in l.name.lower():
                        loc_lines.append(f"- {l.name}, {l.city}")
                    else:
                        loc_lines.append(f"- {l.name}")
            if is_ml:
                return f"ഞങ്ങളുടെ സലൂൺ ലൊക്കേഷനുകൾ:\\n" + "\\n".join(loc_lines) + "\\n\\nമാപ്‌സിനും ഡയറക്ഷനുകൾക്കുമായി 'Salon Finder' കാണുക!"
            return f"Our Kerala salon locations:\\n" + "\\n".join(loc_lines) + "\\n\\nOpen Salon Finder for maps & directions!"
        return "ദയവായി സലൂൺ ഫൈൻഡർ പേജ് ശ്രദ്ധിക്കുക!" if is_ml else "Check our Salon Finder page for locations across Kerala!"

    # Dynamic: staff
    if re.search(r"(staff|stylist|barber|who|aarun|സ്റ്റൈലിസ്റ്റ്)", msg):
        from app.models import Staff
        staff = db.query(Staff).filter(Staff.is_available == True).limit(5).all()
        if staff:
            if is_ml:
                staff_list = "\\n".join([f"- {s.name} — {s.specialization} ({s.experience_years} വർഷത്തെ പരിചയം)" for s in staff])
                return f"ഞങ്ങളുടെ മികച്ച സ്റ്റൈലിസ്റ്റുകൾ:\\n{staff_list}\\n\\nബുക്ക് ചെയ്യുന്ന സമയത്ത് നിങ്ങൾക്ക് തിരഞ്ഞെടുക്കാവുന്നതാണ്!"
            else:
                staff_list = "\\n".join([f"- {s.name} — {s.specialization} ({s.experience_years} yrs exp)" for s in staff])
                return f"Our expert stylists:\\n{staff_list}\\n\\nChoose your preferred stylist when booking!"
        return "ബുക്ക് ചെയ്യുമ്പോൾ നിങ്ങൾക്ക് സ്റ്റൈലിസ്റ്റിനെ തിരഞ്ഞെടുക്കാം!" if is_ml else "We have expert stylists ready for you. Check them during booking!"

    # Dynamic: booking status
    if re.search(r"(my booking|my appointment|status|സ്റ്റാറ്റസ്|എൻ്റെ ബുക്കിംഗ്)", msg):
        bookings = db.query(Booking).filter(
            Booking.user_id == user_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending])
        ).all()
        if bookings:
            if is_ml:
                b_list = "\\n".join([f"- #{b.id}: {b.status.value} എന്ന തിയതി {b.appointment_date.strftime('%d %b %Y %I:%M %p')}" for b in bookings[:5]])
                return f"നിങ്ങളുടെ വരാനിരിക്കുന്ന ബുക്കിംഗുകൾ:\\n{b_list}\\n\\nകൂടുതൽ വിവരങ്ങൾക്ക് 'My Bookings' എടുക്കുക."
            else:
                b_list = "\\n".join([f"- #{b.id}: {b.status.value} on {b.appointment_date.strftime('%d %b %Y %I:%M %p')}" for b in bookings[:5]])
                return f"Your upcoming bookings:\\n{b_list}\\n\\nManage from 'My Bookings'."
        return "നിലവിൽ വരാനിരിക്കുന്ന ബുക്കിംഗുകൾ ഒന്നുമില്ല. ഇപ്പോൾ തന്നെ ബുക്ക് ചെയ്യൂ!" if is_ml else "No upcoming bookings. Book a service now!"

    # Match static patterns
    for pattern, response in RESPONSES.items():
        if response and re.search(pattern, msg):
            return response[1] if is_ml else response[0]

    if is_ml:
        return (
            "ക്ഷമിക്കണം, എനിക്ക് അത് വ്യക്തമായില്ല. എനിക്ക് ഇനി പറയുന്ന കാര്യങ്ങളിൽ സഹായിക്കാൻ കഴിയും:\\n"
            "- സേവനങ്ങൾ & വിലവിവരങ്ങൾ\\n"
            "- ബുക്കിംഗ് സമയം\\n"
            "- സലൂൺ ലൊക്കേഷനുകൾ\\n"
            "- ഓർഡർ ട്രാക്കിംഗ്\\n"
            "- ലോയൽറ്റി പോയിന്റുകൾ\\n"
            "ഇവയിൽ ഏതെങ്കിലും ചോദിച്ചുനോക്കൂ!"
        )

    return (
        "I didn't quite understand that. I can help with:\\n"
        "- Services & pricing\\n"
        "- Booking appointments\\n"
        "- Salon locations\\n"
        "- Order tracking\\n"
        "- Loyalty points\\n"
        "Try asking about any of these!"
    )
"""

# Replace everything before `def send_message`
start_idx = content.find("@router.post(\"/\", response_model=ChatMessageOut)")
if start_idx != -1:
    final_content = new_content + "\n\n" + content[start_idx:]
    file_path.write_text(final_content)
    print("Patched successfully")
else:
    print("Failed to find anchor point")

