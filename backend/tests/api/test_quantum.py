import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_get_quantum_info_classical():
    settings.QUANTUM_ENGINE = "classical"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/quantum/info")
    
    assert response.status_code == 200
    data = response.json()
    assert data["engine"] == "classical"
    assert data["backend"] == "Python Classical Random"
    assert data["protocol"] == "BB84"

@pytest.mark.asyncio
async def test_get_quantum_info_qiskit():
    settings.QUANTUM_ENGINE = "qiskit"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/quantum/info")
    
    assert response.status_code == 200
    data = response.json()
    assert data["engine"] == "qiskit"
    assert data["backend"] == "Aer Simulator"
    assert data["protocol"] == "BB84"
    
    # reset for other tests
    settings.QUANTUM_ENGINE = "classical"
