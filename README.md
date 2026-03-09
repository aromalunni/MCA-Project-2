# ✂️ SmartSalon — Advanced Salon Booking & Management System

> **MCA Academic Project** | FastAPI + React.js + SQLite + WebSockets + Edge TTS + AI Chatbot

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)

---

## 🌟 Features at a Glance

| Feature | Description |
|---------|-------------|
| 📅 Smart Booking | 4-step wizard with real-time slot blocking via WebSocket |
| 💇 Multi-location | 8 Kerala salon branches with maps |
| 💳 Payments | Mock payment gateway with loyalty points & refunds |
| 🤖 AI Chatbot | Bilingual (English + Malayalam) smart assistant |
| 🗣️ Voice / TTS | Edge Neural TTS — speaks responses aloud (ml-IN & en-IN) |
| 📢 Notifications | Real-time WebSocket push notifications |
| 🛍️ Beauty Store | Full e-commerce with cart, orders, tracking |
| 🏆 Loyalty Points | Earn & redeem points at checkout |
| 📊 Admin Dashboard | Analytics, staff, payroll, attendance management |
| 🔍 Face Analysis | AI-powered beauty suggestion (mock/demo) |
| 📍 Salon Finder | Map-based branch locator |

---

## 🗂️ Project Structure

```
smartsalon_fixed/
├── backend/                         # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                  # App entry point, CORS, WebSocket
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic settings from .env
│   │   │   ├── database.py          # SQLAlchemy engine + session factory
│   │   │   └── security.py          # JWT auth + bcrypt password hashing
│   │   ├── models/                  # 20+ SQLAlchemy ORM models
│   │   │   ├── __init__.py          # Model registry
│   │   │   ├── user.py, booking.py, service.py, staff.py
│   │   │   ├── payment.py, order.py, product.py, cart.py
│   │   │   ├── notification.py, loyalty.py, review.py
│   │   │   ├── attendance.py, chat.py, discount.py ...
│   │   ├── schemas/
│   │   │   └── schemas.py           # All Pydantic v2 request/response schemas
│   │   ├── api/routes/              # 24 separate route modules
│   │   │   ├── auth.py              # POST /auth/register, /auth/login (email-based)
│   │   │   ├── bookings.py          # Full booking lifecycle + WS broadcast
│   │   │   ├── payments.py          # Mock payment gateway + loyalty
│   │   │   ├── services.py, staff.py, categories.py, locations.py
│   │   │   ├── packages.py, discounts.py, reviews.py
│   │   │   ├── products.py, cart.py, orders.py
│   │   │   ├── analytics.py         # Dashboard charts & revenue
│   │   │   ├── notifications.py, chat.py, attendance.py
│   │   │   ├── payroll.py, loyalty.py, waitlist.py
│   │   │   └── tts.py               # Edge Neural TTS (ml-IN + en-IN)
│   │   └── websocket/
│   │       └── manager.py           # WS ConnectionManager (broadcast/send_to_user)
│   ├── seed.py                      # Populate DB with sample data
│   ├── requirements.txt
│   └── .env                         # Environment variables (see below)
│
└── frontend/                        # React 18 SPA
    ├── src/
    │   ├── App.jsx                  # Router + auth guard + 404 + loading screen
    │   ├── context/
    │   │   └── AuthContext.js       # Global session + WS + token validation on startup
    │   ├── services/
    │   │   └── api.js               # All Axios API calls with JWT interceptor
    │   ├── pages/                   # 13 pages
    │   │   ├── Landing.jsx          # Public landing page
    │   │   ├── Login.jsx, Register.jsx
    │   │   ├── Booking.jsx          # 4-step booking wizard
    │   │   ├── MyBookings.jsx       # Cancel + reschedule
    │   │   ├── Store.jsx, Cart.jsx, Orders.jsx
    │   │   ├── SalonFinder.jsx, FaceAnalysis.jsx
    │   │   ├── Profile.jsx, AppointmentTracker.jsx
    │   │   └── AdminDashboard.jsx   # Full admin panel (10+ tabs)
    │   ├── components/              # 7 reusable components
    │   │   ├── Navbar.jsx, ChatBot.jsx, NotificationBell.jsx
    │   │   ├── ServiceCard.jsx, SlotSelector.jsx
    │   │   ├── QueueStatus.jsx, Charts.jsx
    │   └── styles/                  # CSS modules
    │       ├── global.css, user-pages.css
    │       ├── admin-dashboard.css, ecom-store.css
    ├── package.json
    └── .env
```

---

## 🚀 Quick Start — Manual Setup (Recommended)

### Prerequisites

- **Python 3.11+** — [Download](https://python.org/downloads)
- **Node.js 18+** — [Download](https://nodejs.org)
- **pip** and **npm** (bundled with the above)

---

### Step 1 — Backend Setup

```bash
# Navigate to backend
cd smartsalon_fixed/backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate          # macOS / Linux
# OR:
venv\Scripts\activate             # Windows

# Install all dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env if needed (default SQLite config works out of the box)
```

#### `.env` file (backend)

```env
DATABASE_URL=sqlite:///./database/smartsalon.db
JWT_SECRET=your-super-secret-key-min-32-chars-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> ⚠️ **Security**: Change `JWT_SECRET` to a strong random string before production!  
> Generate one: `python -c "import secrets; print(secrets.token_hex(32))"`

```bash
# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# (Optional) Seed sample data — locations, services, staff, products
python seed.py
```

✅ Backend running at: **http://localhost:8000**  
📖 API Docs (Swagger): **http://localhost:8000/docs**  
📖 ReDoc: **http://localhost:8000/redoc**

---

### Step 2 — Frontend Setup

```bash
# Open a NEW terminal tab
cd smartsalon_fixed/frontend

# Install Node dependencies
npm install

# Start development server
npm start
```

✅ Frontend running at: **http://localhost:3000**

---

### Step 3 — First Login

After seeding (`python seed.py`), use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@smartsalon.com` | `admin123` |
| User | `user@smartsalon.com` | `user123` |

> 💡 **Note**: Login uses **Email address** (not username).

---

## 🐳 Docker Setup (Optional)

If you have Docker Desktop installed:

```bash
# From the project root
docker-compose up --build

# In a separate terminal — seed the database
docker exec smartsalon_api python seed.py
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

---

## 🏗️ Architecture & Key Flows

### Authentication Flow
```
POST /api/auth/login  { email, password }
  → Verify bcrypt password
  → Issue JWT (HS256, 60-min expiry, sub = user_id)
  → Client stores token in localStorage
  → On app startup: token validated via GET /api/auth/me
  → Expired token → auto logout
  → All requests: Authorization: Bearer <token>
```

### Real-Time Slot Blocking (WebSocket)
```
User opens app → WebSocket ws://localhost:8000/ws/{user_id}
User books slot → POST /api/bookings/
  → DB write (conflict check included)
  → manager.broadcast({ event: "slot_blocked", staff_id, datetime })
  → ALL connected SlotSelector components instantly disable that slot
  → No polling required
```

### Notification System
```
Booking confirmed / cancelled / rescheduled
  → Notification inserted to DB
  → manager.send_to_user(user_id, payload)
  → NotificationBell receives WS event instantly
  → Bell badge increments, dropdown shows new notification
  → User clicks → PUT /api/notifications/{id}/read
```

### TTS (Text-to-Speech)
```
ChatBot receives bot response
  → ttsAPI.speak(text, langCode)  → GET /api/tts/speak?text=...&lang=ml
  → Edge Neural TTS (ml-IN-SobhanaNeural / en-IN-NeerjaNeural)
  → Streaming MP3 response → Audio plays in browser
  → Supports both Bearer header AND ?token= query param
```

### Queue System
```
Booking created → queue_position assigned (count of bookings before it that day)
GET /api/bookings/my/queue returns:
  - queue_position
  - people_ahead
  - estimated_wait_minutes = people_ahead × service.duration_minutes
  - crowd_level: low (<5 today), medium (<10), high (10+)
```

---

## 📊 Full API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login with **email** + password → JWT |
| GET | `/api/auth/me` | User | Get current user info |
| PUT | `/api/auth/profile` | User | Update name / phone |
| PUT | `/api/auth/change-password` | User | Change password |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/` | User | Create booking (future dates only) |
| GET | `/api/bookings/my` | User | My bookings |
| GET | `/api/bookings/my/queue` | User | Queue position for next booking |
| PUT | `/api/bookings/{id}/cancel` | User | Cancel with refund policy |
| PUT | `/api/bookings/{id}/reschedule` | User | Reschedule |
| GET | `/api/bookings/admin/all` | Admin | All bookings |
| PUT | `/api/bookings/admin/{id}/status` | Admin | Update booking status |

### Services & Staff
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services/` | — | Active services |
| GET | `/api/services/all` | Admin | All services |
| POST | `/api/services/` | Admin | Create service |
| GET | `/api/staff/` | — | Available staff |
| GET | `/api/staff/{id}/slots` | User | Available time slots |

### Store (E-commerce)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List products (filterable) |
| GET | `/api/products/{id}` | — | Product detail |
| POST | `/api/cart/` | User | Add to cart |
| GET | `/api/cart/` | User | View cart |
| POST | `/api/orders/` | User | Checkout (creates order from cart) |
| GET | `/api/orders/my` | User | My orders |
| GET | `/api/orders/track/{tracking_id}` | — | Track order by ID |

### Analytics & Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/summary` | Admin | Revenue, bookings, users summary |
| GET | `/api/analytics/peak-hours` | Admin | Peak hour chart data |
| GET | `/api/analytics/popular-services` | Admin | Top services |
| GET | `/api/analytics/daily-bookings` | Admin | Last 7 days bookings |
| GET | `/api/analytics/users/all` | Admin | All users list |
| PUT | `/api/analytics/users/{id}/toggle-active` | Admin | Enable/disable user |

### Chat & TTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat/` | User | Send chatbot message (EN/ML) |
| GET | `/api/chat/history` | User | Chat history |
| GET | `/api/tts/speak?text=...&lang=ml` | User | Edge Neural TTS audio stream |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/{user_id}` | Real-time events (slot_blocked, slot_freed, notification) |

---

## 🔧 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React.js | 18.2.0 |
| Client-side Routing | react-router-dom | 6.23.0 |
| HTTP Client | Axios | 1.6.8 |
| Charts | Chart.js + react-chartjs-2 | 4.4.2 |
| Icons | lucide-react | latest |
| Backend Framework | FastAPI | 0.111.0 |
| ASGI Server | Uvicorn | 0.29.0 |
| ORM | SQLAlchemy | 2.0.30 |
| DB (Dev) | SQLite | — |
| DB (Prod) | PostgreSQL | 15+ |
| Auth | JWT (python-jose) | 3.3.0 |
| Passwords | bcrypt (passlib) | 1.7.4 |
| Schemas | Pydantic v2 | 2.7.1 |
| TTS | Edge TTS (Microsoft Neural) | 6.1.9+ |
| Real-Time | WebSockets (native) | 12.0 |

---

## 🗃️ Database Schema (Key Tables)

```sql
users         (id, name, email, phone, hashed_password, is_admin, is_active,
               loyalty_points, created_at)

services      (id, name, description, duration_minutes, price, category_id,
               location_id, is_active, created_at)

staff         (id, name, specialization, experience_years, is_available,
               work_start, work_end, location_id, created_at)

bookings      (id, user_id→users, service_id→services, staff_id→staff,
               appointment_date, status[enum], queue_position, notes,
               package_id, refund_amount, cancellation_reason, created_at)

payments      (id, booking_id→bookings, user_id→users, amount,
               payment_method[enum], status[enum], transaction_id,
               refund_amount, created_at)

products      (id, name, description, price, discount_price, category_id,
               gender, brand, image_url, stock, is_active, created_at)

orders        (id, user_id, total_amount, payment_method, status, 
               shipping_address, tracking_id, notes, created_at)

notifications (id, user_id→users, title, message, is_read, 
               notification_type, channel, created_at)

loyalty       (id, user_id→users, points, description, booking_id, created_at)
```

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (cost factor 12 — industry standard)
- JWT tokens expire in **60 minutes** (configurable in `.env`)
- Admin routes protected by `require_admin` FastAPI dependency
- SQL injection prevented — all queries via **SQLAlchemy ORM** (parameterized)
- CORS restricted to `localhost:3000` — update `allow_origins` in `main.py` for production
- **Never commit `.env`** to version control — add to `.gitignore`
- First registered user is auto-promoted to admin (only in fresh DB)
- Token validated on every app startup via `/api/auth/me`

---

## 📁 Environment Variables

### Backend (`backend/.env`)

```env
# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL=sqlite:///./database/smartsalon.db
# For production PostgreSQL:
# DATABASE_URL=postgresql://smartsalon:password@localhost:5432/smartsalon

# JWT Configuration
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

---

## 🌐 Supported Languages

The chatbot and TTS system supports:

| Language | Code | TTS Voice |
|----------|------|-----------|
| English (India) | `en` | en-IN-NeerjaNeural |
| Malayalam | `ml` | ml-IN-SobhanaNeural |

Switch language via the 🌐 button in the chatbot.

---

## 🐛 Known Bugs Fixed (v2.0.1)

| # | Bug | Fix Applied |
|---|-----|-------------|
| 1 | Login used non-unique `name` field instead of `email` | Fixed → queries by `email` |
| 2 | `edge-tts` missing from requirements.txt | Added to requirements |
| 3 | TTS 401 error when browser plays via `<Audio src>` | TTS now accepts `?token=` query param |
| 4 | `payload.status.capitalize()` crash on Enum | Fixed → `.value.capitalize()` |
| 5 | Revenue used service price, ignored discounts | Fixed → sums from `Payment.amount` |
| 6 | `_notify_user` duplicated in 2 files | Consolidated (noted for refactor) |
| 7 | Past-date bookings were allowed | Added validation to reject past dates |
| 8 | Login schema had `name` field | Updated to use `email: EmailStr` |
| 9 | `if not user_id` falsy bug | Fixed → `if user_id is None` |
| 10 | ChatBot `useEffect` missing `loaded` dependency | Dependency array corrected |
| 11 | Token not verified on page refresh | AuthContext validates on mount |
| 12 | Wrong `import uuid` inside function body | Moved to module top level |
| 13 | JWT secret was a placeholder string | Documented; must be changed |
| 14 | No 404 page — unknown routes silent redirect | Added proper `NotFound` page |
| 15 | Non-admin `/admin` access silent redirect | Added `AccessDenied` page |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

This project is developed as an **MCA Academic Project**.  
For educational use only.

---

## 👨‍💻 Developer

**SmartSalon** — Built with ❤️ using FastAPI + React  
*Version 2.0.1 — March 2026*
