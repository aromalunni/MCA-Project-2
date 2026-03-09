# SmartSalon - Advanced Salon Booking & Management System

## Project Report

### MCA Final Year Project

---

**Project Title:** SmartSalon - Advanced Salon Booking & Management System

**Department:** Master of Computer Applications (MCA)

**Academic Year:** 2025-2026

---

## Table of Contents

1. Introduction
2. Objectives
3. Problem Statement
4. Proposed System
5. System Requirements
6. System Architecture
7. Module Description
8. Database Design
9. Implementation Details
10. Screenshots Description
11. Testing
12. Conclusion
13. Future Enhancements
14. References

---

## Chapter 1: Introduction

### 1.1 Overview

SmartSalon is a comprehensive web-based salon booking and management system designed to digitize and streamline salon operations across multiple branches in Kerala. The system integrates appointment scheduling, real-time queue management, e-commerce for beauty products, AI-powered bilingual chatbot support, voice-enabled text-to-speech, and a complete admin dashboard for business analytics.

The application follows a modern client-server architecture with a FastAPI Python backend serving RESTful APIs, a React.js single-page application (SPA) as the frontend, and SQLite as the database. Real-time communication between the server and connected clients is achieved through WebSocket connections, enabling instant slot availability updates and push notifications without polling.

### 1.2 Background

The salon and beauty industry in Kerala has seen significant growth in recent years. However, most salons still rely on manual appointment scheduling, phone-based bookings, and paper-based record keeping. This leads to common problems such as double bookings, long waiting times, poor customer experience, and lack of business insights for salon owners.

SmartSalon addresses these challenges by providing a unified digital platform that serves three primary user roles: customers who can book appointments and shop for beauty products, salon staff who provide services, and administrators who manage the entire business operation.

### 1.3 Scope

The system covers the following functional areas:

- Multi-branch salon management across 8 Kerala locations
- Real-time appointment booking with conflict detection
- Queue management with estimated wait times
- Payment processing with loyalty points system
- E-commerce beauty product store with cart, orders, and tracking
- Bilingual AI chatbot (English and Malayalam)
- Text-to-Speech using Microsoft Edge Neural voices
- Staff management including attendance, leaves, and payroll
- Business analytics and reporting dashboard
- Real-time notifications via WebSocket

---

## Chapter 2: Objectives

The primary objectives of this project are:

1. **Automate Appointment Scheduling** - Replace manual phone-based booking with a digital 4-step booking wizard that prevents double bookings through real-time slot blocking.

2. **Real-Time Queue Management** - Provide customers with live queue position updates, estimated wait times, and crowd level indicators to reduce uncertainty.

3. **Multi-Branch Support** - Enable centralized management of 8 salon branches across Kerala with location-specific services, staff, and operating hours.

4. **E-Commerce Integration** - Build an integrated beauty product store with category filtering, cart management, order tracking, and inventory control.

5. **AI-Powered Customer Support** - Implement a bilingual chatbot that understands both English and Malayalam queries, providing instant responses about services, bookings, locations, and pricing.

6. **Voice Accessibility** - Add Text-to-Speech capability using Microsoft Edge Neural voices to read chatbot responses aloud in both English and Malayalam.

7. **Loyalty and Rewards** - Implement a points-based loyalty system where customers earn points on bookings and can redeem them for discounts.

8. **Business Intelligence** - Provide administrators with analytics dashboards showing revenue trends, peak hours, popular services, and customer activity.

9. **Staff Management** - Centralize staff attendance tracking, leave management, and payroll processing.

10. **Secure Authentication** - Implement JWT-based authentication with bcrypt password hashing and role-based access control.

---

## Chapter 3: Problem Statement

Traditional salon management faces several critical challenges:

**For Customers:**
- No visibility into available time slots, leading to wasted trips
- Long and unpredictable waiting times with no queue status information
- Inability to compare services and prices across branches
- No digital record of past appointments or payment history
- Language barriers for Malayalam-speaking customers

**For Salon Owners/Administrators:**
- Double bookings due to manual scheduling
- No data-driven insights into peak hours, popular services, or revenue trends
- Difficulty managing staff schedules, attendance, and payroll across branches
- No integrated system for product sales alongside services
- Poor customer retention due to lack of loyalty programs

**Proposed Solution:**
SmartSalon provides a unified web platform that addresses all these challenges through real-time slot management, WebSocket-based live updates, bilingual AI chatbot, integrated e-commerce, loyalty rewards, and comprehensive admin analytics.

---

## Chapter 4: Proposed System

### 4.1 System Overview

SmartSalon is a full-stack web application with the following architecture:

- **Frontend:** React.js 18 Single Page Application
- **Backend:** FastAPI (Python) RESTful API server
- **Database:** SQLite with SQLAlchemy ORM
- **Real-Time:** WebSocket for live slot blocking and notifications
- **AI/NLP:** Pattern-matching chatbot with bilingual support
- **TTS:** Microsoft Edge Neural Text-to-Speech engine

### 4.2 User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse services, book appointments, shop products, chat with AI assistant, manage bookings, earn/redeem loyalty points |
| **Admin** | Full dashboard access, manage services/staff/locations, view analytics, process payroll, handle orders, manage discounts |

### 4.3 Key Differentiators

1. **Real-Time Slot Blocking** - When one user books a slot, all other connected users see it disabled instantly via WebSocket broadcast, eliminating double bookings without page refresh.

2. **Bilingual Chatbot** - Smart pattern matching with 14+ intent categories supporting both English and Malayalam, with dynamic database-driven responses for services, locations, and booking status.

3. **Neural Text-to-Speech** - Microsoft Edge TTS with premium Indian voices (en-IN-NeerjaNeural and ml-IN-SobhanaNeural) for reading chatbot responses aloud.

4. **Integrated Queue System** - Automatic queue position assignment with crowd level estimation and wait time calculation based on service duration.

---

## Chapter 5: System Requirements

### 5.1 Hardware Requirements

| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Intel Core i3 or equivalent |
| RAM | 4 GB |
| Storage | 2 GB free disk space |
| Display | 1366 x 768 resolution |
| Network | Internet connection for TTS |

### 5.2 Software Requirements

**Development Environment:**

| Software | Version |
|----------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | 2.0+ |
| VS Code | Latest |

**Backend Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.111.0 | Web framework |
| Uvicorn | 0.29.0 | ASGI server |
| SQLAlchemy | 2.0.30 | ORM |
| Pydantic | 2.7.1 | Data validation |
| python-jose | 3.3.0 | JWT tokens |
| passlib | 1.7.4 | Password hashing (bcrypt) |
| edge-tts | 6.1.9+ | Text-to-Speech |
| websockets | 12.0 | WebSocket support |
| aiosqlite | 0.20.0 | Async SQLite |
| httpx | 0.27.0+ | HTTP client |

**Frontend Dependencies:**

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI framework |
| react-router-dom | 6.23.0 | Client-side routing |
| Axios | 1.6.8 | HTTP client |
| Chart.js | 4.4.2 | Data visualization |
| react-chartjs-2 | 5.2.0 | Chart.js React wrapper |
| lucide-react | 0.577.0 | Icon library |

### 5.3 Browser Requirements

| Browser | Minimum Version |
|---------|----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |

---

## Chapter 6: System Architecture

### 6.1 Architecture Diagram

```
+-------------------+        HTTP/REST         +-------------------+
|                   | <---------------------> |                   |
|   React.js SPA    |        WebSocket         |   FastAPI Server  |
|   (Port 3000)     | <---------------------> |   (Port 8000)     |
|                   |                          |                   |
+-------------------+                          +-------------------+
        |                                              |
        |                                              |
   localStorage                                  SQLAlchemy ORM
   (JWT Token)                                         |
                                                       v
                                               +-------------------+
                                               |   SQLite Database |
                                               |  (smartsalon.db)  |
                                               +-------------------+
                                                       |
                                               +-------------------+
                                               |   Edge TTS API    |
                                               | (Microsoft Cloud) |
                                               +-------------------+
```

### 6.2 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | React.js 18 | Component-based, virtual DOM, large ecosystem |
| **Routing** | react-router-dom 6 | Declarative routing with auth guards |
| **State** | React Context API | Lightweight global state without Redux overhead |
| **HTTP** | Axios | Request/response interceptors for JWT |
| **Charts** | Chart.js | Canvas-based, performant charting |
| **Backend** | FastAPI | Async-capable, auto-generated docs, type safety |
| **ORM** | SQLAlchemy 2.0 | Mature ORM with migration support |
| **Database** | SQLite | Zero-config, file-based, ideal for development |
| **Auth** | JWT + bcrypt | Stateless auth, industry-standard password hashing |
| **Real-Time** | WebSocket | Full-duplex communication for instant updates |
| **TTS** | Edge TTS | Free, high-quality neural voices for Indian languages |

### 6.3 Data Flow

**Authentication Flow:**
```
User enters username + password
  -> Frontend sends POST /api/auth/login { name, password }
  -> Backend verifies bcrypt hash
  -> Backend generates JWT (HS256, 60-min expiry, payload: user_id)
  -> Frontend stores token in localStorage
  -> All subsequent requests include: Authorization: Bearer <token>
  -> On app startup: GET /api/auth/me validates stored token
  -> Expired token -> auto logout + redirect to login
```

**Booking Flow:**
```
Step 1: User selects service/package
Step 2: User selects staff member
Step 3: User picks date + available time slot (real-time via WebSocket)
Step 4: User confirms booking + payment method
  -> POST /api/bookings/ with all details
  -> Backend checks for conflicts (same staff + time)
  -> Queue position assigned automatically
  -> Payment record created if method specified
  -> Loyalty points applied if redeemed
  -> WebSocket broadcasts "slot_blocked" to all connected clients
  -> All SlotSelector components instantly disable that slot
  -> Notification sent to user
```

**Real-Time Slot Blocking:**
```
Client A books Slot X
  -> Backend saves booking
  -> WebSocket manager broadcasts: { event: "slot_blocked", staff_id, datetime }
  -> Client B, C, D receive event
  -> SlotSelector adds datetime to blocked Set (O(1) lookup)
  -> UI re-renders: Slot X appears disabled instantly
  -> No polling or page refresh required
```

---

## Chapter 7: Module Description

### 7.1 Authentication Module

**Files:** `auth.py`, `security.py`, `Login.jsx`, `Register.jsx`, `AuthContext.js`

This module handles user registration, login, session management, and role-based access control.

- **Registration:** Collects name, email, phone, password. First registered user is auto-promoted to admin.
- **Login:** Username-based authentication. Returns JWT token with user details.
- **Session Restore:** On app startup, validates stored JWT against `/api/auth/me`.
- **Password Security:** bcrypt hashing with configurable cost factor.
- **Role Guard:** `require_admin()` dependency blocks non-admin access to admin endpoints.

### 7.2 Booking Module

**Files:** `bookings.py`, `Booking.jsx`, `SlotSelector.jsx`

The booking module implements a 4-step wizard with real-time slot management.

- **Step 1 - Service Selection:** Displays active services grouped by category with prices and durations. Supports both individual services and packages.
- **Step 2 - Staff Selection:** Shows available stylists with experience years and specialization.
- **Step 3 - Slot Selection:** Date picker loads available slots from `/staff/{id}/slots`. WebSocket events block/free slots in real-time.
- **Step 4 - Confirmation:** Review summary with payment method selection (Card, UPI, Wallet, Cash). Loyalty point redemption (1 point = Rs. 0.50).

**Conflict Detection Algorithm:**
```python
existing = db.query(Booking).filter(
    Booking.staff_id == staff_id,
    Booking.appointment_date == appointment_date,
    Booking.status != BookingStatus.cancelled
).first()
if existing:
    raise HTTPException(409, "Slot already booked")
```

**Queue Position Calculation:**
```python
position = db.query(Booking).filter(
    Booking.staff_id == staff_id,
    func.date(Booking.appointment_date) == date,
    Booking.appointment_date < current_appointment,
    Booking.status != BookingStatus.cancelled
).count() + 1
```

### 7.3 Payment Module

**Files:** `payments.py`

Mock payment gateway supporting multiple payment methods.

- **Payment Methods:** Card, UPI, Wallet, Cash
- **Transaction ID:** Auto-generated format `TXN_{12-char hex}`
- **Loyalty Points:** Earn 10 points per Rs. 100 spent
- **Refund Processing:** Calculates refund based on cancellation policy (hours before appointment)

### 7.4 E-Commerce Module

**Files:** `products.py`, `cart.py`, `orders.py`, `Store.jsx`, `Cart.jsx`, `Orders.jsx`

Full-featured beauty product store with:

- **Product Catalog:** 28 products across 6 categories (Hair Care, Skin Care, Beard & Grooming, Makeup, Fragrances, Tools & Accessories)
- **Filtering:** Category, gender, brand, price range, search text
- **Sorting:** Popularity, price, rating, newest
- **Cart:** Add, update quantity, remove items
- **Checkout:** Stock validation, discount price application, tracking ID generation (`SS-{8-char hex}`)
- **Order Tracking:** Public tracking endpoint, status updates (placed, confirmed, shipped, delivered, cancelled)

### 7.5 AI Chatbot Module

**Files:** `chat.py`, `ChatBot.jsx`

Bilingual smart assistant with 14+ intent categories.

- **Pattern Matching:** Regex-based intent detection supporting English and Malayalam keywords
- **Dynamic Responses:** Database-driven replies for services (with prices), locations, staff, booking status
- **Static Responses:** Pre-built for booking instructions, cancellation policy, loyalty points, hours
- **Language Detection:** Unicode range detection (U+0D00-U+0D7F for Malayalam)
- **Quick Replies:** Suggested intent buttons for common queries

**Intent Categories:**
| Intent | Trigger Keywords (EN/ML) |
|--------|--------------------------|
| Greeting | hello, hi, namaskaram |
| Services | service, price, cost, vila |
| Booking | book, appointment, slot |
| Location | location, branch, where |
| Staff | stylist, barber, hairdresser |
| Hours | open, close, time, timing |
| Cancel | cancel, refund |
| Loyalty | points, rewards, loyalty |
| Review | review, rating, feedback |
| Store | product, buy, shop |
| Queue | queue, wait, position |
| Face Analysis | face, analysis, suggest |
| Order | order, track, delivery |
| Help | help, support |

### 7.6 Text-to-Speech Module

**Files:** `tts.py`, `ChatBot.jsx`

Voice output using Microsoft Edge Neural TTS engine.

- **Voices:** en-IN-NeerjaNeural (English), ml-IN-SobhanaNeural (Malayalam)
- **Text Cleaning:** Removes markdown characters, caps at 500 chars
- **Streaming:** Returns chunked MP3 audio response
- **Authentication:** Supports both Bearer header and query parameter token (for `<audio src>` tags)

### 7.7 Notification Module

**Files:** `notifications.py`, `NotificationBell.jsx`, `manager.py`

Real-time push notification system.

- **WebSocket Delivery:** Instant notification via `send_to_user()`
- **Database Persistence:** All notifications stored for later retrieval
- **Types:** Booking confirmation, cancellation, rescheduling, payment, waitlist
- **UI:** Bell icon with unread count badge, dropdown with mark-as-read

### 7.8 Analytics Module

**Files:** `analytics.py`, `AdminDashboard.jsx`, `Charts.jsx`

Business intelligence dashboard for administrators.

- **Summary Metrics:** Total bookings, today's bookings, daily revenue, total revenue, active users, crowd level
- **Peak Hours:** Hourly booking distribution (last 30 days) - Bar chart
- **Popular Services:** Top 10 services by booking count - Doughnut chart
- **Daily Trends:** Last 7 days booking count - Line chart
- **User Management:** List all users, toggle active/inactive status

### 7.9 Staff Management Module

**Files:** `staff.py`, `staff_leaves.py`, `attendance.py`, `payroll.py`

Comprehensive staff administration.

- **Staff Profiles:** Name, specialization, experience, working hours, location
- **Slot Generation:** Dynamic available slot calculation based on working hours, service duration, existing bookings, and leaves
- **Leave Management:** Apply, approve, check availability
- **Attendance:** Daily check-in/check-out records, monthly summary
- **Payroll:** Base salary, bonus, deductions, net salary calculation, payment tracking

### 7.10 Location Module

**Files:** `locations.py`, `SalonFinder.jsx`

Multi-branch management with map integration.

- **8 Kerala Locations:** Kochi, Thiruvananthapuram, Kozhikode, Thrissur, Kollam, Kottayam, Alappuzha, Kannur
- **Details:** Address, phone, coordinates (latitude/longitude), operating hours, rating
- **Salon Finder:** Map-based branch locator with distance information

### 7.11 WebSocket Module

**Files:** `manager.py`, `main.py`, `AuthContext.js`

Real-time bidirectional communication.

- **Connection Registry:** Dictionary mapping user_id to list of WebSocket connections
- **Broadcast:** Send event to all connected clients (slot blocking)
- **Targeted:** Send notification to specific user
- **Auto-Reconnect:** Frontend reconnects if connection drops (3-second delay)
- **Cleanup:** Dead connections removed automatically on send failure

---

## Chapter 8: Database Design

### 8.1 Entity-Relationship Overview

The database consists of 21 tables organized into functional groups:

**User Management:** users
**Service Catalog:** service_categories, services
**Staff:** staff, staff_leaves, staff_attendance, staff_payroll
**Booking:** bookings, waitlist_entries
**Payment:** payments, loyalty_transactions
**E-Commerce:** product_categories, products, cart_items, orders, order_items
**Communication:** notifications, chat_messages
**Policy:** cancellation_policies, discounts, packages, package_services

### 8.2 Table Definitions

**users**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | NULLABLE |
| hashed_password | VARCHAR(255) | NOT NULL |
| is_admin | BOOLEAN | DEFAULT FALSE |
| is_active | BOOLEAN | DEFAULT TRUE |
| loyalty_points | INTEGER | DEFAULT 0 |
| created_at | DATETIME | DEFAULT NOW |

**services**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| duration_minutes | INTEGER | NOT NULL |
| price | FLOAT | NOT NULL |
| category_id | INTEGER | FK -> service_categories |
| location_id | INTEGER | FK -> locations |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | DATETIME | DEFAULT NOW |

**staff**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| specialization | VARCHAR(200) | NULLABLE |
| experience_years | INTEGER | DEFAULT 0 |
| is_available | BOOLEAN | DEFAULT TRUE |
| work_start | TIME | NOT NULL |
| work_end | TIME | NOT NULL |
| location_id | INTEGER | FK -> locations |
| created_at | DATETIME | DEFAULT NOW |

**bookings**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK -> users, NOT NULL |
| service_id | INTEGER | FK -> services, NOT NULL |
| staff_id | INTEGER | FK -> staff, NOT NULL |
| appointment_date | DATETIME | NOT NULL |
| status | ENUM | pending/confirmed/completed/cancelled |
| queue_position | INTEGER | NULLABLE |
| notes | TEXT | NULLABLE |
| package_id | INTEGER | FK -> packages, NULLABLE |
| cancellation_reason | TEXT | NULLABLE |
| refund_amount | FLOAT | NULLABLE |
| created_at | DATETIME | DEFAULT NOW |

**payments**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| booking_id | INTEGER | FK -> bookings |
| user_id | INTEGER | FK -> users |
| amount | FLOAT | NOT NULL |
| payment_method | ENUM | card/upi/wallet/cash |
| status | ENUM | pending/completed/failed/refunded |
| transaction_id | VARCHAR(50) | NULLABLE |
| refund_amount | FLOAT | NULLABLE |
| created_at | DATETIME | DEFAULT NOW |

**products**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| price | FLOAT | NOT NULL |
| discount_price | FLOAT | NULLABLE |
| category_id | INTEGER | FK -> product_categories |
| gender | ENUM | men/women/unisex |
| brand | VARCHAR(100) | NULLABLE |
| image_url | TEXT | NULLABLE |
| stock | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | DATETIME | DEFAULT NOW |

**orders**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK -> users |
| total_amount | FLOAT | NOT NULL |
| payment_method | ENUM | card/upi/wallet/cash |
| status | ENUM | placed/confirmed/shipped/delivered/cancelled |
| shipping_address | TEXT | NULLABLE |
| tracking_id | VARCHAR(20) | UNIQUE |
| notes | TEXT | NULLABLE |
| created_at | DATETIME | DEFAULT NOW |
| updated_at | DATETIME | DEFAULT NOW |

**locations**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| address | TEXT | NOT NULL |
| city | VARCHAR(100) | NOT NULL |
| district | VARCHAR(100) | NULLABLE |
| state | VARCHAR(50) | DEFAULT 'Kerala' |
| phone | VARCHAR(20) | NULLABLE |
| latitude | FLOAT | NULLABLE |
| longitude | FLOAT | NULLABLE |
| rating | FLOAT | DEFAULT 4.5 |
| opening_time | TIME | NULLABLE |
| closing_time | TIME | NULLABLE |
| is_active | BOOLEAN | DEFAULT TRUE |

**notifications**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK -> users |
| title | VARCHAR(200) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| notification_type | VARCHAR(50) | NOT NULL |
| channel | VARCHAR(20) | DEFAULT 'in_app' |
| created_at | DATETIME | DEFAULT NOW |

**chat_messages**
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FK -> users |
| message | TEXT | NOT NULL |
| response | TEXT | NULLABLE |
| is_bot | BOOLEAN | DEFAULT FALSE |
| created_at | DATETIME | DEFAULT NOW |

---

## Chapter 9: Implementation Details

### 9.1 Backend Implementation

**Framework: FastAPI**

FastAPI was chosen for its high performance, automatic API documentation, and native async support. The application is structured as follows:

```
app/
  main.py          -> Application factory, CORS, route registration
  core/
    config.py      -> Environment variable management
    database.py    -> SQLAlchemy engine configuration
    security.py    -> JWT generation, password hashing
  models/          -> 21 SQLAlchemy ORM models
  schemas/         -> Pydantic v2 request/response schemas
  api/routes/      -> 22 REST API route modules
  websocket/       -> WebSocket connection manager
```

**Key Implementation Patterns:**

1. **Dependency Injection:** FastAPI's `Depends()` is used for database sessions (`get_db`), authenticated users (`get_current_user`), and admin checks (`require_admin`).

2. **Pydantic Validation:** All request bodies are validated through Pydantic v2 schemas with field validators for password strength, rating range, and positive values.

3. **WebSocket Broadcasting:** The `ConnectionManager` class maintains a dictionary of user_id to WebSocket connections, enabling both broadcast (all users) and targeted (specific user) messaging.

### 9.2 Frontend Implementation

**Framework: React.js 18**

The frontend is a single-page application with 13 pages and 7 reusable components.

**Key Implementation Patterns:**

1. **Context API:** `AuthContext` provides global authentication state, WebSocket connection management, and session restoration across all components.

2. **Axios Interceptors:** Request interceptor auto-attaches JWT token. Response interceptor handles 401 errors by clearing storage and redirecting to login.

3. **Protected Routes:** `PrivateRoute` wrapper checks authentication before rendering. Admin routes have additional `is_admin` check.

4. **Real-Time Updates:** `SlotSelector` component maintains a `Set` of blocked slots, updated via WebSocket events for O(1) lookup performance.

### 9.3 API Endpoints Summary

The backend exposes 80+ RESTful API endpoints organized across 22 route modules:

| Module | Endpoints | Auth Level |
|--------|-----------|------------|
| Auth | 5 | Public / User |
| Services | 5 | Public / Admin |
| Categories | 5 | Public / Admin |
| Staff | 4 | Public / Admin |
| Locations | 5 | Public / Admin |
| Bookings | 7 | User / Admin |
| Payments | 5 | User / Admin |
| Products | 7 | Public / Admin |
| Cart | 4 | User |
| Orders | 7 | User / Admin |
| Reviews | 5 | User / Public |
| Loyalty | 4 | User / Admin |
| Notifications | 4 | User |
| Chat | 2 | User |
| TTS | 1 | User |
| Analytics | 6 | Admin |
| Discounts | 5 | Public / Admin |
| Packages | 5 | Public / Admin |
| Staff Leaves | 4 | Admin |
| Attendance | 5 | Admin |
| Payroll | 5 | Admin |
| Waitlist | 4 | User / Admin |

### 9.4 WebSocket Events

| Event | Trigger | Payload | Receivers |
|-------|---------|---------|-----------|
| `slot_blocked` | Booking created | staff_id, datetime | All clients |
| `slot_freed` | Booking cancelled | staff_id, datetime | All clients |
| `notification` | Various actions | title, message, type | Specific user |

---

## Chapter 10: Screenshots Description

The following pages are available in the application:

1. **Landing Page** - Marketing page with feature showcase, service cards, testimonials, animated counters, and product preview

2. **Login Page** - Username and password login with premium split-screen design, background image, feature highlights

3. **Register Page** - User registration with name, email, phone, password, and confirmation

4. **Booking Page** - 4-step wizard: Service selection -> Staff selection -> Date/Slot picker -> Review and payment

5. **My Bookings** - List of user's bookings with status, cancel, and reschedule options

6. **Beauty Store** - Product catalog with category filters, gender tabs, brand filters, price range, grid/list view, product modals

7. **Shopping Cart** - Cart items with quantity controls, price summary, checkout button

8. **Orders** - Order history with status tracking, tracking ID, and cancellation

9. **Salon Finder** - Map-based branch locator showing 8 Kerala locations

10. **Face Analysis** - AI-powered beauty suggestion demo page

11. **Profile** - User profile management with name, phone update, and password change

12. **Chatbot** - Floating AI assistant with bilingual support, voice input/output, quick replies

13. **Admin Dashboard** - 14-tab admin panel:
    - Overview with analytics charts
    - Bookings management
    - Services CRUD
    - Staff management
    - User management
    - Categories management
    - Packages management
    - Locations management
    - Staff leaves
    - Cancellation policies
    - Discounts management
    - Products management
    - Orders management
    - Attendance and Payroll

---

## Chapter 11: Testing

### 11.1 Testing Approach

The application was tested using manual testing across all modules.

### 11.2 Test Cases

**Authentication Testing:**
| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Valid admin login | username: admin, password: admin | Redirect to /admin | Pass |
| Valid user login | username: Sandra, password: admin | Redirect to /booking | Pass |
| Invalid credentials | username: wrong, password: wrong | Error: Invalid credentials | Pass |
| Empty fields | Empty form submission | HTML validation error | Pass |
| Session restore | Refresh page while logged in | Session maintained | Pass |
| Token expiry | Wait 60 minutes | Auto logout to /login | Pass |

**Booking Testing:**
| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Create booking | Service + Staff + Slot | Booking confirmed, queue assigned | Pass |
| Double booking | Same staff + same time | Error: Slot already booked | Pass |
| Past date booking | Select past date | Error: Cannot book past dates | Pass |
| Cancel booking | Click cancel on booking | Status changed, refund calculated | Pass |
| Reschedule | New date/time | Booking updated | Pass |
| Real-time slot block | Book from Browser A | Slot disabled in Browser B | Pass |

**E-Commerce Testing:**
| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Add to cart | Click Add to Cart | Item added, cart count updated | Pass |
| Checkout | Confirm order | Order created, tracking ID generated | Pass |
| Stock check | Add out-of-stock item | Error: Insufficient stock | Pass |
| Order cancel | Cancel placed order | Stock restored, status updated | Pass |
| Filter products | Select category + gender | Products filtered correctly | Pass |

**Chatbot Testing:**
| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| English greeting | "hello" | Welcome message in English | Pass |
| Malayalam greeting | "namaskaram" | Welcome in Malayalam | Pass |
| Service query | "what services" | Dynamic service list with prices | Pass |
| Location query | "where are you" | List of 8 Kerala branches | Pass |
| TTS output | Enable voice + send message | Audio plays in correct language | Pass |

---

## Chapter 12: Conclusion

SmartSalon successfully demonstrates a comprehensive, production-ready salon management system that addresses real-world challenges faced by the salon industry in Kerala. The project integrates multiple modern technologies to deliver a seamless experience for customers, staff, and administrators.

**Key Achievements:**

1. **Real-Time Operations** - WebSocket-based slot blocking eliminates double bookings entirely, a common pain point in salon management.

2. **Bilingual Support** - The AI chatbot understands both English and Malayalam, making it accessible to a wider customer base in Kerala.

3. **Voice Technology** - Integration of Microsoft Edge Neural TTS provides high-quality voice output in Indian languages, enhancing accessibility.

4. **Integrated E-Commerce** - The beauty product store adds a revenue stream beyond services, with full cart-to-order workflow.

5. **Business Intelligence** - The analytics dashboard provides actionable insights for salon owners to optimize staffing, pricing, and service offerings.

6. **Scalable Architecture** - The modular FastAPI backend with 22 route modules can be extended with new features without major refactoring.

The system was developed using industry-standard tools and practices: REST API design, JWT authentication, WebSocket real-time communication, bcrypt password hashing, and responsive UI design.

---

## Chapter 13: Future Enhancements

1. **Online Payment Gateway** - Integrate Razorpay or Stripe for real payment processing instead of mock transactions.

2. **SMS/Email Notifications** - Send appointment reminders and confirmations via SMS (Twilio) and email (SendGrid).

3. **AI Style Recommendation** - Implement actual AI-based hairstyle recommendations using image analysis with TensorFlow or OpenCV.

4. **Mobile Application** - Develop React Native or Flutter mobile apps for iOS and Android.

5. **Multi-Language Expansion** - Add support for Hindi, Tamil, and other regional languages.

6. **Calendar Integration** - Sync bookings with Google Calendar and Apple Calendar.

7. **Staff Mobile App** - Dedicated app for staff to view schedules, mark attendance, and manage appointments.

8. **PostgreSQL Migration** - Move from SQLite to PostgreSQL for production deployment with connection pooling.

9. **Docker Deployment** - Containerize the application for easy cloud deployment on AWS, GCP, or Azure.

10. **Review Analytics** - Sentiment analysis on customer reviews using NLP to identify improvement areas.

---

## Chapter 14: References

1. FastAPI Documentation - https://fastapi.tiangolo.com
2. React.js Documentation - https://react.dev
3. SQLAlchemy Documentation - https://docs.sqlalchemy.org
4. Pydantic v2 Documentation - https://docs.pydantic.dev
5. Chart.js Documentation - https://www.chartjs.org
6. JWT (JSON Web Tokens) - https://jwt.io
7. Edge TTS - https://github.com/rany2/edge-tts
8. WebSocket Protocol - RFC 6455
9. Axios HTTP Client - https://axios-http.com
10. Lucide Icons - https://lucide.dev
11. bcrypt Password Hashing - https://en.wikipedia.org/wiki/Bcrypt
12. Web Speech API - https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

---

## Appendix: How to Run

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin |
| User | Sandra | admin |

---
