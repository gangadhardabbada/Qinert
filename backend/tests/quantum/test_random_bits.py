import pytest
from app.quantum.random_bits import RandomBitGenerator

def test_generate_bits_length():
    generator = RandomBitGenerator()
    bits = generator.generate_bits(100)
    assert len(bits) == 100

def test_generate_bits_values():
    generator = RandomBitGenerator()
    bits = generator.generate_bits(100)
    assert all(b in [0, 1] for b in bits)

def test_generate_bits_deterministic():
    gen1 = RandomBitGenerator(seed=42)
    gen2 = RandomBitGenerator(seed=42)
    assert gen1.generate_bits(100) == gen2.generate_bits(100)

def test_generate_bits_zero_length():
    generator = RandomBitGenerator()
    assert generator.generate_bits(0) == []

def test_generate_bits_negative_length():
    generator = RandomBitGenerator()
    assert generator.generate_bits(-5) == []

def test_generate_bits_invalid_type():
    generator = RandomBitGenerator()
    with pytest.raises(TypeError):
        generator.generate_bits("100")  # type: ignore

