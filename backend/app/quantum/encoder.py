"""
Quantum Encoder Simulation Module.

This module simulates Alice encoding her classical bits into quantum states 
based on her randomly chosen bases.
"""
from typing import List

class AliceEncoder:
    """
    Simulates encoding classical bits into quantum states.
    """
    
    def encode(self, bits: List[int], bases: List[str]) -> List[str]:
        """
        Simulate Alice encoding her bits into qubits.
        
        Classical representation used:
        - Basis '+', Bit 0 -> State '|0>'
        - Basis '+', Bit 1 -> State '|1>'
        - Basis 'x', Bit 0 -> State '|+>'
        - Basis 'x', Bit 1 -> State '|->'

        Args:
            bits (List[int]): The initial random bits.
            bases (List[str]): The chosen encoding bases ('+' or 'x').

        Returns:
            List[str]: String representations of the simulated quantum states.
        
        Raises:
            ValueError: If the length of bits and bases do not match.
        """
        if len(bits) != len(bases):
            raise ValueError("Length of bits and bases must be equal.")
            
        states = []
        for bit, basis in zip(bits, bases):
            if bit not in (0, 1):
                raise ValueError(f"Unknown bit '{bit}'")
            if basis == '+':
                states.append('|0>' if bit == 0 else '|1>')
            elif basis == 'x':
                states.append('|+>' if bit == 0 else '|->')
            else:
                raise ValueError(f"Unknown basis '{basis}'")
                
        return states
