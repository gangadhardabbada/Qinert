import pytest

from app.quantum.qiskit_engine import QiskitEngine
from qiskit import QuantumCircuit

def test_prepare_and_measure_qubit():
    engine = QiskitEngine()
    
    # Test encoding 0 in rectilinear
    qc1 = engine.prepare_qubit(0, "rectilinear")
    assert isinstance(qc1, QuantumCircuit)
    # Measuring in same basis should yield 0
    qc1_measured = engine.measure_qubit(qc1, "rectilinear")
    res1 = engine.simulator.run(qc1_measured, shots=1).result().get_counts()
    assert int(list(res1.keys())[0]) == 0
    
    # Test encoding 1 in diagonal
    qc2 = engine.prepare_qubit(1, "diagonal")
    qc2_measured = engine.measure_qubit(qc2, "diagonal")
    res2 = engine.simulator.run(qc2_measured, shots=1).result().get_counts()
    assert int(list(res2.keys())[0]) == 1

def test_full_qiskit_bb84_execution():
    # Only test a few qubits to save simulation time in tests
    engine = QiskitEngine(num_qubits=16)
    
    # No eavesdropper
    results = engine.execute_bb84(simulate_eavesdropper=False)
    assert results["is_secure"] is True
    assert results["qber"] == 0.0
    assert results["final_hex_key"] is not None
    assert len(results["alice_bits"]) == 16
    assert len(results["quantum_states"]) == 16

def test_qiskit_bb84_with_eavesdropper():
    engine = QiskitEngine(num_qubits=64)
    
    results = engine.execute_bb84(simulate_eavesdropper=True)
    # Eavesdropper induces ~25% QBER, so it should be insecure
    assert results["qber"] > 0.0
    assert results["is_secure"] is False
    assert results["final_hex_key"] is None
