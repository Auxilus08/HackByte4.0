from fastapi import WebSocket
from typing import List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, event_type: str, data: dict):
        payload = json.dumps({"type": event_type, "data": data}, default=str)
        stale: List[WebSocket] = []
        for connection in list(self.active_connections):  # iterate over a snapshot copy
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)
        # Remove stale connections after iteration to avoid mutation during loop
        for conn in stale:
            self.disconnect(conn)

manager = ConnectionManager()
