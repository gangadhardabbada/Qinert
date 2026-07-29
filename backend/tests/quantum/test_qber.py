import pytest
from app.quantum.qber import QBERCalculator

def test_calculate_qber_identical():
    calculator = QBERCalculator()
    qber = calculator.calculate_qber([0, 1, 0], [0, 1, 0])
    assert qber == 0.0

def test_calculate_qber_completely_different():
    calculator = QBERCalculator()
    qber = calculator.calculate_qber([0, 1, 0], [1, 0, 1])
    assert qber == 1.0

def test_calculate_qber_partial():
    calculator = QBERCalculator()
    qber = calculator.calculate_qber([0, 0, 0, 0], [0, 1, 0, 1])
    assert qber == 0.5

def test_calculate_qber_mismatch_length():
    calculator = QBERCalculator()
    with pytest.raises(ValueError, match="Alice's and Bob's sifted keys must be of the same length"):
        calculator.calculate_qber([0], [0, 1])

def test_is_channel_secure():
    calculator = QBERCalculator()
    assert calculator.is_channel_secure(0.0) is True
    assert calculator.is_channel_secure(0.10) is True
    assert calculator.is_channel_secure(0.12) is False

def test_calculate_qber_empty():
    calculator = QBERCalculator()
    assert calculator.calculate_qber([], []) == 0.0

