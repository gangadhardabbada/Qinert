"""
Quantum Measurement Simulation Module.

This module is responsible for simulating the physical measurement of qubits 
as they are received by Bob in the BB84 protocol.
"""
import random
from typing import List, Optional

class BobMeasurement:
    """
    Simulates the measurement of quantum states in specific bases.
    """
    
    def __init__(self, seed: Optional[int] = None):
        """
        Initialize the measurement simulator.

        Args:
            seed (int, optional): Seed for deterministic measurement outcomes 
                                  when bases mismatch.
        """
        self.rng = random.Random(seed) if seed is not None else random.Random()
    
    def measure_qubits(self, alice_bits: List[int], alice_bases: List[str], bob_bases: List[str]) -> List[int]:
        """
        Simulate Bob's measurement of incoming qubits.
        
        Logic:
        - If Alice's basis == Bob's basis, he measures the exact bit Alice sent.
        - If Alice's basis != Bob's basis, the measurement collapses randomly 
          (50/50 chance of measuring 0 or 1).

        Args:
            alice_bits (List[int]): The original bits encoded by Alice.
            alice_bases (List[str]): The bases Alice used for encoding.
            bob_bases (List[str]): The bases Bob uses for measurement.

        Returns:
            List[int]: The resulting classical bits obtained by Bob after measurement.
            
        Raises:
            ValueError: If input lists are not of the same length.
        """
        if not (len(alice_bits) == len(alice_bases) == len(bob_bases)):
            raise ValueError("Lengths of alice_bits, alice_bases, and bob_bases must match.")
            
        measured_bits = []
        for a_bit, a_basis, b_basis in zip(alice_bits, alice_bases, bob_bases):
            if a_basis == b_basis:
                # Deterministic outcome: Bob measures exactly what Alice sent
                measured_bits.append(a_bit)
            else:
                # Probabilistic outcome: Quantum superposition collapses randomly
                measured_bits.append(self.rng.choice([0, 1]))
                
        return measured_bits
