"""
Quantum Bit Error Rate (QBER) Calculation Module.

Calculates the error rate present in the quantum channel by comparing 
subsets of Alice's and Bob's sifted keys.
"""
from typing import List

class QBERCalculator:
    """
    Calculates and evaluates the Quantum Bit Error Rate for a given session.
    """
    
    def calculate_qber(self, alice_sifted: List[int], bob_sifted: List[int]) -> float:
        """
        Calculate the error rate between two matched bit samples.

        Args:
            alice_sifted (List[int]): Alice's sifted bits.
            bob_sifted (List[int]): Bob's sifted bits.

        Returns:
            float: The calculated Quantum Bit Error Rate (percentage as a float 0.0 - 1.0).
            
        Raises:
            ValueError: If the sifted keys are of different lengths.
        """
        if len(alice_sifted) != len(bob_sifted):
            raise ValueError("Alice's and Bob's sifted keys must be of the same length to calculate QBER.")
            
        if not alice_sifted:
            return 0.0 # Prevent division by zero if lists are empty
            
        errors = sum(1 for a, b in zip(alice_sifted, bob_sifted) if a != b)
        return errors / len(alice_sifted)

    def is_channel_secure(self, qber_value: float, threshold: float = 0.11) -> bool:
        """
        Determine if the channel is considered secure based on the QBER.

        Args:
            qber_value (float): The calculated QBER.
            threshold (float): The maximum tolerable error rate (default ~11% for BB84).

        Returns:
            bool: True if the channel is secure (QBER < threshold), False otherwise.
        """
        return qber_value < threshold
