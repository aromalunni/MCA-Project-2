# SmartSalon - Advanced Salon Booking & Management System

**MCA Final Year Project** | FastAPI + React.js + SQLite + WebSockets + Edge TTS + AI Chatbot

---

## Features

- **Smart Booking** - 4-step booking wizard with real-time slot blocking via WebSocket
- **Multi-location** - 8 Kerala salon branches with map-based salon finder
- **Payments** - Mock payment gateway with loyalty points & refunds
- **AI Chatbot** - Bilingual smart assistant (English + Malayalam)
- **Voice / TTS** - Edge Neural TTS (ml-IN & en-IN) speaks responses aloud
- **Notifications** - Real-time WebSocket push notifications
- **Beauty Store** - Full e-commerce with cart, orders, and tracking
- **Loyalty Points** - Earn & redeem points at checkout
- **Admin Dashboard** - Analytics, staff management, payroll, attendance
- **Face Analysis** - AI-powered beauty suggestion (demo)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React.js | 18.2.0 |
| Routing | react-router-dom | 6.23.0 |
| HTTP Client | Axios | 1.6.8 |
| Charts | Chart.js + react-chartjs-2 | 4.4.2 |
| Icons | lucide-react | 0.577.0 |
| Backend | FastAPI | 0.111.0 |
| ASGI Server | Uvicorn | 0.29.0 |
| ORM | SQLAlchemy | 2.0.30 |
| Database | SQLite | 3 |
| Auth | JWT (python-jose) | 3.3.0 |
| Passwords | bcrypt (passlib) | 1.7.4 |
| Validation | Pydantic v2 | 2.7.1 |
| TTS | Edge TTS (Microsoft Neural) | 6.1.9+ |
| Real-Time | WebSockets | 12.0 |

---

## Project Structure

```
smartsalon_fixed/
├── backend/
│   ├── app/
│   │   ├── main.py                  # App entry point, CORS, WebSocket
│   │   ├── core/
│   │   │   ├── config.py            # Settings from .env
│   │   │   ├── database.py          # SQLAlchemy engine + session
│   │   │   └── security.py          # JWT + bcrypt password hashing
│   │   ├── models/                  # 20+ SQLAlchemy ORM models
│   │   │   ├── user.py              # User model
│   │   │   ├── booking.py           # Booking model
│   │   │   ├── service.py           # Service model
│   │   │   ├── staff.py             # Staff model
│   │   │   ├── payment.py           # Payment model
│   │   │   ├── order.py             # Order model
│   │   │   ├── product.py           # Product model
│   │   │   ├── cart.py              # Cart model
│   │   │   ├── notification.py      # Notification model
│   │   │   ├── loyalty.py           # Loyalty points model
│   │   │   ├── review.py            # Review model
│   │   │   ├── attendance.py        # Staff attendance
│   │   │   ├── chat.py              # Chat messages
│   │   │   ├── discount.py          # Discounts
│   │   │   └── enums.py             # All enum types
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic v2 request/response schemas
│   │   ├── api/routes/              # 22 REST API route modules
│   │   │   ├── auth.py              # Login & register (username-based)
│   │   │   ├── bookings.py          # Booking CRUD + WebSocket broadcast
│   │   │   ├── payments.py          # Payment processing + loyalty
│   │   │   ├── services.py          # Service management
│   │   │   ├── staff.py             # Staff + slot availability
│   │   │   ├── categories.py        # Service categories
│   │   │   ├── locations.py         # Salon locations
│   │   │   ├── packages.py          # Service packages
│   │   │   ├── discounts.py         # Discount management
│   │   │   ├── reviews.py           # Customer reviews
│   │   │   ├── products.py          # Store products
│   │   │   ├── cart.py              # Shopping cart
│   │   │   ├── orders.py            # Order management
│   │   │   ├── analytics.py         # Dashboard data
│   │   │   ├── notifications.py     # Notification CRUD
│   │   │   ├── chat.py              # Chatbot (EN + ML)
│   │   │   ├── attendance.py        # Staff attendance
│   │   │   ├── payroll.py           # Staff payroll
│   │   │   ├── loyalty.py           # Loyalty points
│   │   │   ├── waitlist.py          # Waitlist management
│   │   │   ├── staff_leaves.py      # Staff leave management
│   │   │   ├── cancellation_policies.py
│   │   │   └── tts.py              # Text-to-Speech (Edge TTS)
│   │   └── websocket/
│   │       └── manager.py           # WebSocket connection manager
│   ├── seed.py                      # Database seeder (sample data)
│   ├── requirements.txt             # Python dependencies
│   └── database/
│       └── smartsalon.db            # SQLite database (auto-created)
│
└── frontend/
    ├── src/
    │   ├── App.jsx                  # Router + auth guard + protected routes
    │   ├── context/
    │   │   └── AuthContext.js       # Auth state + WebSocket + session restore
    │   ├── services/
    │   │   └── api.js               # Axios API calls + JWT interceptor
    │   ├── pages/
    │   │   ├── Landing.jsx          # Public home page
    │   │   ├── Login.jsx            # Username + password login
    │   │   ├── Register.jsx         # User registration
    │   │   ├── Booking.jsx          # 4-step booking wizard
    │   │   ├── MyBookings.jsx       # View, cancel, reschedule bookings
    │   │   ├── Store.jsx            # Beauty product store
    │   │   ├── Cart.jsx             # Shopping cart
    │   │   ├── Orders.jsx           # Order history & tracking
    │   │   ├── SalonFinder.jsx      # Map-based salon locator
    │   │   ├── FaceAnalysis.jsx     # AI face analysis (demo)
    │   │   ├── Profile.jsx          # User profile management
    │   │   ├── AppointmentTracker.jsx
    │   │   └── AdminDashboard.jsx   # Full admin panel (10+ tabs)
    │   ├── components/
    │   │   ├── Navbar.jsx           # Navigation bar
    │   │   ├── ChatBot.jsx          # AI chatbot widget
    │   │   ├── NotificationBell.jsx # Real-time notification bell
    │   │   ├── ServiceCard.jsx      # Service display card
    │   │   ├── SlotSelector.jsx     # Time slot picker
    │   │   ├── QueueStatus.jsx      # Queue position display
    │   │   └── Charts.jsx           # Chart.js components
    │   └── styles/
    │       ├── global.css
    │       ├── user-pages.css
    │       ├── admin-dashboard.css
    │       └── ecom-store.css
    └── package.json
```

---

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 18+

### Step 1 - Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate          # macOS / Linux
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed.py

# Start the backend server
uvicorn app.main:app --reload
```

Backend runs at: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/docs**

### Step 2 - Frontend Setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Login Credentials

After running `python seed.py`, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin` |
| User | `Sandra` | `admin` |

> **Note**: Login uses **Username** (not email). Username is case-sensitive.

---

## Database Schema

```sql
users           (id, name, email, phone, hashed_password, is_admin,
                 is_active, loyalty_points, created_at)

services        (id, name, description, duration_minutes, price,
                 category_id, location_id, is_active, created_at)

service_categories (id, name, description, icon, is_active)

staff           (id, name, specialization, experience_years, is_available,
                 work_start, work_end, location_id, created_at)

locations       (id, name, address, city, district, state, phone,
                 latitude, longitude, rating, opening_time, closing_time)

bookings        (id, user_id, service_id, staff_id, appointment_date,
                 status, queue_position, notes, package_id,
                 refund_amount, cancellation_reason, created_at)

payments        (id, booking_id, user_id, amount, payment_method,
                 status, transaction_id, refund_amount, created_at)

products        (id, name, description, price, discount_price,
                 category_id, gender, brand, image_url, stock, created_at)

orders          (id, user_id, total_amount, payment_method, status,
                 shipping_address, tracking_id, created_at)

order_items     (id, order_id, product_id, quantity, price)

cart_items       (id, user_id, product_id, quantity)

notifications   (id, user_id, title, message, is_read,
                 notification_type, channel, created_at)

loyalty_transactions (id, user_id, points, description, booking_id, created_at)

reviews         (id, booking_id, user_id, staff_id, service_id,
                 rating, comment, created_at)

chat_messages   (id, user_id, message, response, is_bot, created_at)

discounts       (id, service_id, discount_type, discount_value,
                 start_date, end_date, is_active, created_at)

staff_leaves    (id, staff_id, leave_date, leave_type, reason, is_approved)

staff_attendance (id, staff_id, date, check_in, check_out, status, notes)

staff_payroll   (id, staff_id, month, year, base_salary, bonus,
                 deductions, net_salary, status, paid_date)

waitlist        (id, user_id, staff_id, service_id, preferred_date,
                 status, created_at)

cancellation_policies (id, name, hours_before, refund_percent, penalty_amount)

packages        (id, name, description, discount_percent, is_active)
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | - | Register new user |
| POST | `/api/auth/login` | - | Login with username + password |
| GET | `/api/auth/me` | User | Get current user info |
| PUT | `/api/auth/profile` | User | Update name / phone |
| PUT | `/api/auth/change-password` | User | Change password |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/services/` | - | List active services |
| GET | `/api/services/all` | Admin | List all services |
| POST | `/api/services/` | Admin | Create service |
| PUT | `/api/services/{id}` | Admin | Update service |
| DELETE | `/api/services/{id}` | Admin | Delete service |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories/` | - | List active categories |
| GET | `/api/categories/all` | Admin | List all categories |
| POST | `/api/categories/` | Admin | Create category |
| PUT | `/api/categories/{id}` | Admin | Update category |
| DELETE | `/api/categories/{id}` | Admin | Delete category |

### Staff
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff/` | - | List available staff |
| POST | `/api/staff/` | Admin | Create staff |
| PUT | `/api/staff/{id}` | Admin | Update staff |
| GET | `/api/staff/{id}/slots` | User | Get available time slots |

### Locations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/locations/` | - | List active locations |
| GET | `/api/locations/all` | Admin | List all locations |
| POST | `/api/locations/` | Admin | Create location |
| PUT | `/api/locations/{id}` | Admin | Update location |
| DELETE | `/api/locations/{id}` | Admin | Delete location |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings/` | User | Create booking |
| GET | `/api/bookings/my` | User | My bookings |
| GET | `/api/bookings/my/queue` | User | Queue position |
| PUT | `/api/bookings/{id}/cancel` | User | Cancel booking |
| PUT | `/api/bookings/{id}/reschedule` | User | Reschedule booking |
| GET | `/api/bookings/admin/all` | Admin | All bookings |
| PUT | `/api/bookings/admin/{id}/status` | Admin | Update status |

### Payments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/payments/initiate` | User | Initiate payment |
| PUT | `/api/payments/{id}/confirm` | User | Confirm payment |
| PUT | `/api/payments/{id}/refund` | Admin | Process refund |
| GET | `/api/payments/my` | User | My payments |
| GET | `/api/payments/admin/all` | Admin | All payments |

### Store - Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | - | List products (filterable) |
| GET | `/api/products/all` | Admin | All products |
| GET | `/api/products/{id}` | - | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/{id}` | Admin | Update product |
| DELETE | `/api/products/{id}` | Admin | Delete product |
| GET | `/api/product-categories` | - | Product categories |

### Store - Cart & Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart/` | User | View cart |
| POST | `/api/cart/` | User | Add to cart |
| PUT | `/api/cart/{id}` | User | Update cart item |
| DELETE | `/api/cart/{id}` | User | Remove from cart |
| POST | `/api/orders/` | User | Checkout |
| GET | `/api/orders/my` | User | My orders |
| GET | `/api/orders/track/{tracking_id}` | - | Track order |
| PUT | `/api/orders/my/{id}/cancel` | User | Cancel order |
| GET | `/api/orders/admin/all` | Admin | All orders |
| PUT | `/api/orders/admin/{id}/status` | Admin | Update order status |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews/` | User | Create review |
| GET | `/api/reviews/staff/{id}` | - | Staff reviews |
| GET | `/api/reviews/service/{id}` | - | Service reviews |
| GET | `/api/reviews/my` | User | My reviews |

### Loyalty Points
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/loyalty/balance` | User | Current balance |
| GET | `/api/loyalty/history` | User | Points history |
| POST | `/api/loyalty/redeem` | User | Redeem points |
| GET | `/api/loyalty/admin/all` | Admin | All loyalty data |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications/` | User | List notifications |
| GET | `/api/notifications/unread-count` | User | Unread count |
| PUT | `/api/notifications/{id}/read` | User | Mark as read |
| PUT | `/api/notifications/mark-all-read` | User | Mark all read |

### Chat & TTS
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat/` | User | Send chatbot message |
| GET | `/api/chat/history` | User | Chat history |
| GET | `/api/tts/speak` | User | Text-to-speech audio |

### Analytics (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/summary` | Admin | Revenue & booking summary |
| GET | `/api/analytics/peak-hours` | Admin | Peak hour data |
| GET | `/api/analytics/popular-services` | Admin | Popular services |
| GET | `/api/analytics/daily-bookings` | Admin | Daily booking chart |
| GET | `/api/analytics/users/all` | Admin | All users |
| PUT | `/api/analytics/users/{id}/toggle-active` | Admin | Toggle user active |

### Staff Management (Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/staff-leaves/` | Admin | All staff leaves |
| POST | `/api/staff-leaves/` | Admin | Create leave |
| GET | `/api/attendance/` | Admin | Attendance records |
| POST | `/api/attendance/` | Admin | Record attendance |
| GET | `/api/payroll/` | Admin | Payroll records |
| POST | `/api/payroll/` | Admin | Create payroll |
| PUT | `/api/payroll/{id}/pay` | Admin | Mark as paid |

### Discounts & Packages
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/discounts/` | - | Active discounts |
| POST | `/api/discounts/` | Admin | Create discount |
| GET | `/api/packages/` | - | Active packages |
| POST | `/api/packages/` | Admin | Create package |

### WebSocket
| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/ws/{user_id}` | Real-time events (slot blocking, notifications) |

---

## Architecture

### Authentication Flow
```
POST /api/auth/login { name, password }
  -> Verify bcrypt password hash
  -> Generate JWT token (HS256, 60-min expiry)
  -> Client stores token in localStorage
  -> All API requests include: Authorization: Bearer <token>
  -> On app startup: token validated via GET /api/auth/me
  -> Expired/invalid token -> auto logout + redirect to login
```

### Real-Time Slot Blocking
```
User connects -> WebSocket ws://localhost:8000/ws/{user_id}
User books a slot -> POST /api/bookings/
  -> Database write with conflict check
  -> WebSocket broadcast: { event: "slot_blocked", staff_id, datetime }
  -> All connected clients instantly disable that slot
```

### Chatbot (Bilingual)
```
User sends message -> POST /api/chat/
  -> Pattern matching against English + Malayalam keywords
  -> Dynamic responses for services, bookings, locations, loyalty
  -> Optional TTS: GET /api/tts/speak?text=...&lang=ml
  -> Edge Neural TTS voices: ml-IN-SobhanaNeural, en-IN-NeerjaNeural
```

### Queue System
```
Booking created -> queue_position assigned
GET /api/bookings/my/queue returns:
  - queue_position, people_ahead
  - estimated_wait_minutes = people_ahead x service.duration_minutes
  - crowd_level: low / medium / high
```

---

## Sample Data (after seed.py)

- **7 users** (1 admin + 6 regular users)
- **8 Kerala salon locations** (Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Kollam, Kottayam, Alappuzha, Kannur)
- **10 salon services** (Haircut, Hair Colour, Beard Trim, Facial, Hair Spa, Manicure, Pedicure, Bridal Makeup, etc.)
- **6 service categories** (Hair, Beard & Grooming, Skin Care, Spa, Nails, Bridal)
- **10 staff members** with specializations
- **28 beauty products** across 6 categories
- **3 cancellation policies**
- **3 active discounts**

---

## Security

- Passwords hashed with **bcrypt**
- JWT tokens with **60-minute** expiry
- Admin routes protected by `require_admin` dependency
- SQL injection prevented via **SQLAlchemy ORM** (parameterized queries)
- Token validated on every app startup via `/api/auth/me`
- First registered user auto-promoted to admin (fresh DB only)

---

## Supported Languages

| Language | Chatbot | TTS Voice |
|----------|---------|-----------|
| English (India) | Yes | en-IN-NeerjaNeural |
| Malayalam | Yes | ml-IN-SobhanaNeural |

---

## Developer

**SmartSalon** - MCA Final Year Project
Built with FastAPI + React.js
