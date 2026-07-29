import pytest
from app.quantum.encoder import AliceEncoder

def test_encoder_mappings():
    encoder = AliceEncoder()
    # Test specific known mappings based on BB84 protocol
    # 0, '+' -> |0>
    # 1, '+' -> |1>
    # 0, 'x' -> |+>
    # 1, 'x' -> |->
    bits = [0, 1, 0, 1]
    bases = ['+', '+', 'x', 'x']
    states = encoder.encode(bits, bases)
    
    assert states[0] == '|0>'
    assert states[1] == '|1>'
    assert states[2] == '|+>'
    assert states[3] == '|->'

def test_encoder_length_mismatch():
    encoder = AliceEncoder()
    with pytest.raises(ValueError, match="Length of bits and bases must be equal."):
        encoder.encode([0, 1], ['+'])

def test_encoder_invalid_basis():
    encoder = AliceEncoder()
    with pytest.raises(ValueError):
        encoder.encode([0], ['y'])

def test_encoder_invalid_bit():
    encoder = AliceEncoder()
    with pytest.raises(ValueError):
        encoder.encode([2], ['+'])

