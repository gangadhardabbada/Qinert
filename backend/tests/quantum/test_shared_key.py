import pytest
from app.quantum.shared_key import SharedKeyGenerator

def test_generate_hex_key_valid():
    generator = SharedKeyGenerator()
    bits = [0, 1, 0, 0, 1, 1, 0, 1]
    hex_key = generator.generate_hex_key(bits)
    # The output is a sha256 hex digest, so it should be 64 chars long
    assert len(hex_key) == 64
    assert isinstance(hex_key, str)

def test_generate_hex_key_padding():
    generator = SharedKeyGenerator()
    bits = [1, 0, 1]
    hex_key = generator.generate_hex_key(bits)
    assert len(hex_key) == 64

def test_generate_hex_key_empty():
    generator = SharedKeyGenerator()
    hex_key = generator.generate_hex_key([])
    assert len(hex_key) == 64

