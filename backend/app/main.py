"""
SmartSalon — FastAPI Application Entry Point
Complete Salon Management + Beauty Store + Chatbot
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base, get_db
from app.core.security import decode_token
from app.api.routes import (
    auth, services, staff, bookings, notifications, analytics,
    payments, reviews, staff_leaves, categories, packages,
    locations, loyalty, waitlist, cancellation_policies, discounts,
    products, cart, orders, chat, attendance, payroll, tts,
)
from app.websocket.manager import manager

# Create all tables on startup (use Alembic migrations for production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartSalon API",
    description="Advanced Salon Booking and Management System with Beauty Store",
    version="2.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── REST ROUTERS ─────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(staff_leaves.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(packages.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(loyalty.router, prefix="/api")
app.include_router(waitlist.router, prefix="/api")
app.include_router(cancellation_policies.router, prefix="/api")
app.include_router(discounts.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")
app.include_router(payroll.router, prefix="/api")
app.include_router(tts.router, prefix="/api")


# ─── WEBSOCKET ENDPOINT ───────────────────────────────────────────────────────
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


@app.get("/health")
def health():
    return {"status": "ok", "connections": manager.total_connections}


@app.get("/")
def root():
    return {"message": "SmartSalon API v2.0", "docs": "/docs"}
