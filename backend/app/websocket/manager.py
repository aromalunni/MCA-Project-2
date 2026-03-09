"""
WebSocket Connection Manager.

Maintains a registry of active WebSocket connections.
When a slot is booked, broadcasts to ALL connected clients
so their booking UI immediately disables that slot — no polling needed.
"""

import json
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # All active connections: {user_id: [websocket, ...]}
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active:
            self.active[user_id] = []
        self.active[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active:
            self.active[user_id].discard(websocket) if hasattr(
                self.active[user_id], "discard"
            ) else None
            try:
                self.active[user_id].remove(websocket)
            except ValueError:
                pass
            if not self.active[user_id]:
                del self.active[user_id]

    async def broadcast(self, message: dict):
        """Send event to every connected client."""
        payload = json.dumps(message)
        disconnected = []
        for user_id, sockets in self.active.items():
            for ws in sockets:
                try:
                    await ws.send_text(payload)
                except Exception:
                    disconnected.append((user_id, ws))

        # Clean up dead connections
        for uid, ws in disconnected:
            self.disconnect(ws, uid)

    async def send_to_user(self, user_id: int, message: dict):
        """Send event to a specific user only (e.g. their booking confirmed)."""
        payload = json.dumps(message)
        if user_id in self.active:
            for ws in self.active[user_id]:
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    @property
    def total_connections(self) -> int:
        return sum(len(v) for v in self.active.values())


# Singleton — shared across the entire FastAPI app lifetime
manager = ConnectionManager()
