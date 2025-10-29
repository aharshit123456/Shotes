import pytest
import httpx
import asyncio
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_messages_empty():
    response = client.get("/api/v1/messages/demo")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_websocket_chat():
    with client.websocket_connect("/ws/chat/demo") as websocket:
        # Send a message
        message_data = {
            "author": "Test User",
            "text": "Hello World"
        }
        websocket.send_text(str(message_data).replace("'", '"'))
        
        # Receive the broadcasted message
        data = websocket.receive_text()
        response = eval(data)  # Simple parsing for test
        
        assert response["type"] == "message"
        assert response["payload"]["author"] == "Test User"
        assert response["payload"]["text"] == "Hello World"
