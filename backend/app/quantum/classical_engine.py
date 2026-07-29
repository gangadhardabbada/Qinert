from typing import List, Any, Optional

from app.quantum.engine import QuantumEngine
from app.quantum.random_bits import RandomBitGenerator
from app.quantum.random_bases import RandomBasesGenerator
from app.quantum.encoder import AliceEncoder
from app.quantum.measurement import BobMeasurement
from app.quantum.sifting import BasisSifter
from app.quantum.qber import QBERCalculator
from app.quantum.shared_key import SharedKeyGenerator

class ClassicalEngine(QuantumEngine):
    """
    Classical mathematics-based simulation of the QuantumEngine.
    This wraps the pre-existing logic components.
    """
    
    def __init__(self, seed: Optional[int] = None):
        self.bit_gen = RandomBitGenerator(seed=seed)
        self.bases_gen = RandomBasesGenerator(seed=seed)
        self.encoder = AliceEncoder()
        self.measurement = BobMeasurement(seed=seed)
        self.sifter = BasisSifter()
        self.qber_calc = QBERCalculator()
        self.key_gen = SharedKeyGenerator()

    def generate_random_bits(self, num_bits: int) -> List[int]:
        return self.bit_gen.generate_bits(num_bits)

    def generate_random_bases(self, num_bases: int) -> List[str]:
        return self.bases_gen.generate_bases(num_bases)

    def encode(self, bits: List[int], bases: List[str]) -> Any:
        states = self.encoder.encode(bits, bases)
        return {
            "bits": bits,
            "bases": bases,
            "states": states
        }

    def measure(self, states: Any, bases: List[str]) -> List[int]:
        alice_bits = states["bits"]
        alice_bases = states["bases"]
        return self.measurement.measure_qubits(alice_bits, alice_bases, bases)

    def sift(self, alice_bases: List[str], bob_bases: List[str], measured_bits: List[int]) -> List[int]:
        return self.sifter.sift_bits(alice_bases, bob_bases, measured_bits)

    def calculate_qber(self, alice_bits: List[int], bob_bits: List[int]) -> float:
        return self.qber_calc.calculate_qber(alice_bits, bob_bits)

    def generate_shared_key(self, sifted_bits: List[int]) -> str:
        return self.key_gen.generate_hex_key(sifted_bits)
