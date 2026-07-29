from abc import ABC, abstractmethod
from typing import List, Any

class QuantumEngine(ABC):
    """
    Abstract interface for executing quantum operations.
    Implementations can be classical simulations, Qiskit AER simulators, 
    or true quantum hardware backends.
    """
    
    @abstractmethod
    def generate_random_bits(self, num_bits: int) -> List[int]:
        """Generates random classical bits (0 or 1)."""
        pass
        
    def set_noise_model(self, noise_params: dict):
        """Optional override to inject noise configurations for simulations."""
        pass

    @abstractmethod
    def generate_random_bases(self, num_bases: int) -> List[str]:
        """Generates random measurement bases (e.g., 'rectilinear' or 'diagonal')."""
        pass

    @abstractmethod
    def encode(self, bits: List[int], bases: List[str]) -> Any:
        """Encodes bits into quantum states using the given bases."""
        pass

    @abstractmethod
    def measure(self, states: Any, bases: List[str]) -> List[int]:
        """Measures the quantum states in the provided bases, returning classical bits."""
        pass

    @abstractmethod
    def sift(self, alice_bases: List[str], bob_bases: List[str], measured_bits: List[int]) -> List[int]:
        """Sifts the measured bits by comparing bases and keeping matches."""
        pass

    @abstractmethod
    def calculate_qber(self, alice_bits: List[int], bob_bits: List[int]) -> float:
        """Calculates the Quantum Bit Error Rate (QBER)."""
        pass

    @abstractmethod
    def generate_shared_key(self, sifted_bits: List[int]) -> str:
        """Performs privacy amplification/extraction to generate a final hex key string."""
        pass
