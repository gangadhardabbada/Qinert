import pytest
from app.quantum.sifting import BasisSifter

def test_sifting_logic():
    sifting = BasisSifter()
    alice_bases = ['+', 'x', '+', 'x', '+']
    bob_bases   = ['+', '+', '+', 'x', 'x']
    bits        = [0, 1, 1, 0, 1]
    
    # Match at index 0, 2, 3
    sifted_bits = sifting.sift_bits(alice_bases, bob_bases, bits)
    assert sifted_bits == [0, 1, 0]

def test_sifting_no_match():
    sifting = BasisSifter()
    alice_bases = ['+', 'x']
    bob_bases   = ['x', '+']
    bits        = [1, 0]
    
    sifted_bits = sifting.sift_bits(alice_bases, bob_bases, bits)
    assert sifted_bits == []

def test_sifting_length_mismatch():
    sifting = BasisSifter()
    with pytest.raises(ValueError, match="Lengths of alice_bases, bob_bases, and bits must match."):
        sifting.sift_bits(['+'], ['+'], [0, 1])
