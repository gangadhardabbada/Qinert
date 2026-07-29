import pytest
from app.quantum.bb84 import BB84Simulation

def test_bb84_simulation_no_eavesdropper():
    sim = BB84Simulation(num_qubits=256, seed=42)
    results = sim.execute_exchange(simulate_eavesdropper=False)
    
    assert "alice_bits" in results
    assert "bob_measured_bits" in results
    assert "sifted_key_length" in results
    assert "qber" in results
    assert "final_hex_key" in results
    
    # Without eavesdropper, QBER should be exactly 0.0
    assert results["qber"] == 0.0
    assert results["final_hex_key"] is not None

def test_bb84_simulation_with_eavesdropper():
    sim = BB84Simulation(num_qubits=256, seed=42)
    results = sim.execute_exchange(simulate_eavesdropper=True)
    
    # With eavesdropper, QBER should be roughly 25%
    # It might exceed the threshold and result in no key
    assert results["qber"] > 0.11
    assert results["final_hex_key"] is None

def test_bb84_simulation_deterministic():
    sim1 = BB84Simulation(num_qubits=128, seed=123)
    res1 = sim1.execute_exchange(simulate_eavesdropper=False)
    
    sim2 = BB84Simulation(num_qubits=128, seed=123)
    res2 = sim2.execute_exchange(simulate_eavesdropper=False)
    
    assert res1["final_hex_key"] == res2["final_hex_key"]

def test_bb84_simulation_zero_qubits():
    sim = BB84Simulation(num_qubits=0, seed=42)
    results = sim.execute_exchange(simulate_eavesdropper=False)
    
    assert results["initial_qubit_count"] == 0
    assert len(results["alice_bits"]) == 0
    assert results["sifted_key_length"] == 0
    assert results["qber"] == 0.0

