"""
Random Bit Generation Module.

This module is responsible for generating the raw random bits used as the 
initial classical information before quantum encoding.
"""
import random
from typing import List, Optional

class RandomBitGenerator:
    """
    Handles the generation of random bit sequences for QKD protocols.
    """
    
    def __init__(self, seed: Optional[int] = None):
        """
        Initialize the generator.

        Args:
            seed (int, optional): A seed value for deterministic generation during testing.
        """
        self.rng = random.Random(seed) if seed is not None else random.Random()
    
    def generate_bits(self, length: int) -> List[int]:
        """
        Generate a sequence of random bits.

        Args:
            length (int): The number of random bits to generate.

        Returns:
            List[int]: A list containing integers 0 and 1.
        """
        return [self.rng.choice([0, 1]) for _ in range(length)]
