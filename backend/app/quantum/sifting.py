"""
Key Sifting Module.

This module simulates the public discussion phase where Alice and Bob 
compare their randomly chosen bases and discard the bits where their bases 
did not match.
"""
from typing import List

class BasisSifter:
    """
    Performs the sifting of raw bits based on basis comparison.
    """
    
    def sift_bits(self, alice_bases: List[str], bob_bases: List[str], bits: List[int]) -> List[int]:
        """
        Perform the key sifting phase by keeping bits only where bases match.

        Args:
            alice_bases (List[str]): Bases used by Alice for encoding.
            bob_bases (List[str]): Bases used by Bob for measurement.
            bits (List[int]): The raw bits to be sifted (typically Bob's measured bits 
                              or Alice's original bits).

        Returns:
            List[int]: The sifted sequence of bits.
            
        Raises:
            ValueError: If input lists do not have the same length.
        """
        if not (len(alice_bases) == len(bob_bases) == len(bits)):
            raise ValueError("Lengths of alice_bases, bob_bases, and bits must match.")
            
        sifted = []
        for a_basis, b_basis, bit in zip(alice_bases, bob_bases, bits):
            if a_basis == b_basis:
                sifted.append(bit)
                
        return sifted
