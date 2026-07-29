"""
Random Bases Generation Module.

This module handles the selection of measurement and encoding bases 
(e.g., rectilinear '+' and diagonal 'x') for quantum protocols.
"""
import random
from typing import List, Optional

class RandomBasesGenerator:
    """
    Handles the random selection of quantum bases for encoding and measurement.
    """
    
    def __init__(self, seed: Optional[int] = None):
        """
        Initialize the generator.

        Args:
            seed (int, optional): A seed value for deterministic generation during testing.
        """
        self.rng = random.Random(seed) if seed is not None else random.Random()
    
    def generate_bases(self, length: int) -> List[str]:
        """
        Generate a sequence of random bases.

        Args:
            length (int): The number of bases to generate.

        Returns:
            List[str]: A list of strings representing the chosen bases 
            ('+' for rectilinear, 'x' for diagonal).
        """
        return [self.rng.choice(['+', 'x']) for _ in range(length)]
