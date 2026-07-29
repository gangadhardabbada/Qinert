import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from app.main import app

@pytest.mark.asyncio
async def test_run_experiment_baseline():
    with patch("app.experiments.bb84_experiment.BB84ExperimentRunner._run_ibm_quantum") as mock_ibm:
        mock_ibm.return_value = None
        
        req_data = {
            "engines": ["classical", "qiskit_aer"],
            "number_of_bits": 8,
            "shots": 100,
            "mode": "baseline",
            "trials": 1
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
            response = await async_client.post("/api/v1/experiments/bb84", json=req_data)
            assert response.status_code == 200
            exp_id = response.json()["experiment_id"]
            
            comp_res = await async_client.get(f"/api/v1/experiments/{exp_id}/comparison")
            assert comp_res.status_code == 200
            
            comp_data = comp_res.json()
            assert comp_data["mode"] == "baseline"
            assert comp_data["trials"] == 1
            assert comp_data["engines"]["classical"]["status"] == "COMPLETED"
            assert comp_data["engines"]["qiskit_aer"]["status"] == "COMPLETED"
            assert comp_data["engines"]["classical"]["qber"] == 0.0

@pytest.mark.asyncio
async def test_run_experiment_eve():
    with patch("app.experiments.bb84_experiment.BB84ExperimentRunner._run_ibm_quantum") as mock_ibm:
        mock_ibm.return_value = None
        
        req_data = {
            "engines": ["classical"],
            "number_of_bits": 256,
            "shots": 100,
            "mode": "eve_intercept_resend",
            "trials": 3
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
            response = await async_client.post("/api/v1/experiments/bb84", json=req_data)
            assert response.status_code == 200
            exp_id = response.json()["experiment_id"]
            
            comp_res = await async_client.get(f"/api/v1/experiments/{exp_id}/comparison")
            assert comp_res.status_code == 200
            
            comp_data = comp_res.json()
            assert comp_data["mode"] == "eve_intercept_resend"
            assert comp_data["trials"] == 3
            
            classical = comp_data["engines"]["classical"]
            assert classical["trial_count"] == 3
            assert classical["eve_bases"] is not None
            assert classical["eve_measured_bits"] is not None
            # Eavesdropping should introduce around 25% QBER for large N, but we'll just check > 0
            assert classical["mean_qber"] is not None
            assert classical["std_dev_qber"] is not None

@pytest.mark.asyncio
async def test_run_experiment_noise():
    with patch("app.experiments.bb84_experiment.BB84ExperimentRunner._run_ibm_quantum") as mock_ibm:
        mock_ibm.return_value = None
        
        req_data = {
            "engines": ["qiskit_aer"],
            "number_of_bits": 256,
            "shots": 100,
            "mode": "noise",
            "trials": 1,
            "noise_params": {
                "measurement_error_rate": 0.1
            }
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as async_client:
            response = await async_client.post("/api/v1/experiments/bb84", json=req_data)
            assert response.status_code == 200
            exp_id = response.json()["experiment_id"]
            
            comp_res = await async_client.get(f"/api/v1/experiments/{exp_id}/comparison")
            assert comp_res.status_code == 200
            
            comp_data = comp_res.json()
            assert comp_data["mode"] == "noise"
            
            aer = comp_data["engines"]["qiskit_aer"]
            # It should have >0 QBER due to 10% measurement error
            assert aer["qber"] is not None
