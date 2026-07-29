import pytest
from app.quantum.random_bases import RandomBasesGenerator

def test_generate_bases_length():
    generator = RandomBasesGenerator()
    bases = generator.generate_bases(100)
    assert len(bases) == 100

def test_generate_bases_values():
    generator = RandomBasesGenerator()
    bases = generator.generate_bases(100)
    assert all(b in ['+', 'x'] for b in bases)

def test_generate_bases_deterministic():
    gen1 = RandomBasesGenerator(seed=42)
    gen2 = RandomBasesGenerator(seed=42)
    assert gen1.generate_bases(100) == gen2.generate_bases(100)

def test_generate_bases_zero_length():
    generator = RandomBasesGenerator()
    assert generator.generate_bases(0) == []

def test_generate_bases_negative_length():
    generator = RandomBasesGenerator()
    assert generator.generate_bases(-5) == []

def test_generate_bases_invalid_type():
    generator = RandomBasesGenerator()
    with pytest.raises(TypeError):
        generator.generate_bases("100")  # type: ignore

