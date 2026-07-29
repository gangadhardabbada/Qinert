"""
BB84 Protocol Orchestration Module.

This module provides the high-level orchestration interface for the classical 
simulation of the BB84 Quantum Key Distribution (QKD) protocol.
"""
from typing import Dict, Any, Optional

from app.quantum.random_bits import RandomBitGenerator
from app.quantum.random_bases import RandomBasesGenerator
from app.quantum.encoder import AliceEncoder
from app.quantum.measurement import BobMeasurement
from app.quantum.sifting import BasisSifter
from app.quantum.qber import QBERCalculator
from app.quantum.shared_key import SharedKeyGenerator

class BB84Simulation:
    """
    Orchestrates the entire classical simulation of the BB84 protocol.
    """
    
    def __init__(self, num_qubits: int = 1024, seed: Optional[int] = None):
        """
        Initialize the BB84 simulation.

        Args:
            num_qubits (int): The initial number of qubits to exchange.
            seed (int, optional): A master seed for deterministic execution. 
                                  If provided, all sub-components will be seeded 
                                  deterministically based on it.
        """
        self.num_qubits = num_qubits
        
        # Initialize sub-components. If a seed is provided, we offset it slightly 
        # for different components to ensure independence while maintaining determinism.
        self.bit_gen = RandomBitGenerator(seed=seed)
        self.alice_bases_gen = RandomBasesGenerator(seed=seed + 1 if seed is not None else None)
        self.bob_bases_gen = RandomBasesGenerator(seed=seed + 2 if seed is not None else None)
        self.encoder = AliceEncoder()
        self.measurement = BobMeasurement(seed=seed + 3 if seed is not None else None)
        self.sifter = BasisSifter()
        self.qber_calc = QBERCalculator()
        self.key_gen = SharedKeyGenerator()

    def execute_exchange(self, simulate_eavesdropper: bool = False) -> Dict[str, Any]:
        """
        Execute the full BB84 protocol simulation.

        Args:
            simulate_eavesdropper (bool): If True, forces an intercept-resend attack 
                                          which will naturally raise the QBER.

        Returns:
            Dict[str, Any]: A comprehensive dictionary containing all intermediate 
                            and final states of the protocol exchange, including:
                            - alice_bits, alice_bases
                            - bob_bases, bob_measured_bits
                            - sifted_key
                            - qber
                            - is_secure
                            - final_hex_key (if secure)
        """
        # 1. Alice generates random bits and bases
        alice_bits = self.bit_gen.generate_bits(self.num_qubits)
        alice_bases = self.alice_bases_gen.generate_bases(self.num_qubits)
        
        # 2. Alice encodes qubits (for visualization purposes, not strictly needed for classical math)
        quantum_states = self.encoder.encode(alice_bits, alice_bases)
        
        # 3. Eve interception (optional)
        transmitted_bits = alice_bits
        transmitted_bases = alice_bases
        if simulate_eavesdropper:
            eve_bases_gen = RandomBasesGenerator(seed=None)
            eve_measurement = BobMeasurement(seed=None)
            eve_bases = eve_bases_gen.generate_bases(self.num_qubits)
            # Eve measures the qubits, inherently altering the states where her basis mismatches Alice's
            transmitted_bits = eve_measurement.measure_qubits(alice_bits, alice_bases, eve_bases)
            # Eve resends them using her measurement bases (intercept-resend attack)
            transmitted_bases = eve_bases 
            
        # 4. Bob generates his measurement bases and measures incoming qubits
        bob_bases = self.bob_bases_gen.generate_bases(self.num_qubits)
        bob_measured_bits = self.measurement.measure_qubits(transmitted_bits, transmitted_bases, bob_bases)
        
        # 5. Public Discussion: Sifting
        # Both parties compare original bases and keep only the bits where they matched
        alice_sifted_bits = self.sifter.sift_bits(alice_bases, bob_bases, alice_bits)
        bob_sifted_bits = self.sifter.sift_bits(alice_bases, bob_bases, bob_measured_bits)
        
        # 6. Error Estimation (QBER)
        # In a real scenario, they would sacrifice a portion of the sifted key to calculate QBER.
        # Here we just compare the entirety of the sifted keys since we have omniscience in simulation.
        qber_value = self.qber_calc.calculate_qber(alice_sifted_bits, bob_sifted_bits)
        is_secure = self.qber_calc.is_channel_secure(qber_value)
        
        # 7. Final Key Generation (Privacy Amplification Simulation)
        final_key = None
        if is_secure:
            # We assume successful error correction for minor errors if any, 
            # and use Alice's sifted bits as the definitive key material.
            final_key = self.key_gen.generate_hex_key(alice_sifted_bits)
            
        return {
            "initial_qubit_count": self.num_qubits,
            "alice_bits": alice_bits,
            "alice_bases": alice_bases,
            "quantum_states": quantum_states,
            "bob_bases": bob_bases,
            "bob_measured_bits": bob_measured_bits,
            "sifted_key_length": len(alice_sifted_bits),
            "alice_sifted_bits": alice_sifted_bits,
            "bob_sifted_bits": bob_sifted_bits,
            "qber": qber_value,
            "is_secure": is_secure,
            "final_hex_key": final_key
        }
