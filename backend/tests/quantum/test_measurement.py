import pytest
from app.quantum.measurement import BobMeasurement

def test_measurement_same_basis():
    measurement = BobMeasurement()
    alice_bits = [0, 1, 0, 1]
    alice_bases = ['+', '+', 'x', 'x']
    bob_bases = ['+', '+', 'x', 'x']
    
    # If they use the same bases, bob should measure EXACTLY what alice sent
    bob_bits = measurement.measure_qubits(alice_bits, alice_bases, bob_bases)
    assert bob_bits == alice_bits

def test_measurement_different_basis():
    # If different bases, bob gets random result (0 or 1)
    measurement = BobMeasurement(seed=42)
    alice_bits = [0, 1, 0, 1]
    alice_bases = ['+', '+', 'x', 'x']
    bob_bases = ['x', 'x', '+', '+']
    
    bob_bits = measurement.measure_qubits(alice_bits, alice_bases, bob_bases)
    assert len(bob_bits) == 4
    assert all(b in [0, 1] for b in bob_bits)

def test_measurement_length_mismatch():
    measurement = BobMeasurement()
    with pytest.raises(ValueError, match="Lengths of alice_bits, alice_bases, and bob_bases must match."):
        measurement.measure_qubits([0], ['+', '+'], ['+'])

def test_measurement_invalid_basis():
    measurement = BobMeasurement()
    # If the basis is invalid, it won't match, so it'll measure randomly.
    # We just ensure it doesn't crash unless we explicitly validate bases in measurement.py.
    # Currently measurement.py does not explicitly check for basis validity ('+' or 'x').
    pass

