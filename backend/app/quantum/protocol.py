from typing import Dict, Any, Optional

from app.quantum.engine import QuantumEngine

class BB84Protocol:
    """
    Orchestrates the entire BB84 protocol exchange using any underlying QuantumEngine.
    """
    
    def __init__(self, engine: QuantumEngine, num_qubits: int = 1024):
        """
        Initialize the BB84 protocol with a specific engine.

        Args:
            engine (QuantumEngine): The underlying engine (e.g. ClassicalEngine or QiskitEngine).
            num_qubits (int): The initial number of qubits to exchange.
        """
        self.engine = engine
        self.num_qubits = num_qubits

    def execute_exchange(self, simulate_eavesdropper: bool = False) -> Dict[str, Any]:
        """
        Execute the full BB84 protocol using the injected QuantumEngine.
        """
        # 1. Alice generates random bits and bases
        alice_bits = self.engine.generate_random_bits(self.num_qubits)
        alice_bases = self.engine.generate_random_bases(self.num_qubits)
        
        # 2. Alice encodes qubits
        quantum_states = self.engine.encode(alice_bits, alice_bases)
        
        # 3. Eve interception (only supported gracefully on some engines if they allow mid-flight measurement)
        # Note: True eavesdropping in Qiskit might require a different approach (like adding gates mid-circuit).
        # For our architecture, if simulate_eavesdropper is True, we can use the engine to measure and re-encode.
        transmitted_states = quantum_states
        transmitted_bases = alice_bases
        if simulate_eavesdropper:
            eve_bases = self.engine.generate_random_bases(self.num_qubits)
            eve_measured_bits = self.engine.measure(transmitted_states, eve_bases)
            # Intercept and resend
            transmitted_states = self.engine.encode(eve_measured_bits, eve_bases)
            transmitted_bases = eve_bases
            
        # 4. Bob generates his measurement bases and measures incoming qubits
        bob_bases = self.engine.generate_random_bases(self.num_qubits)
        bob_measured_bits = self.engine.measure(transmitted_states, bob_bases)
        
        job_id = None
        if hasattr(self.engine, "submit_job"):
            job_id = self.engine.submit_job(transmitted_states, bob_bases)
        
        # 5. Public Discussion: Sifting
        alice_sifted_bits = self.engine.sift(alice_bases, bob_bases, alice_bits)
        bob_sifted_bits = self.engine.sift(alice_bases, bob_bases, bob_measured_bits)
        
        # 6. Error Estimation (QBER)
        qber_value = self.engine.calculate_qber(alice_sifted_bits, bob_sifted_bits)
        # We can implement a secure check here, typically QBER < 0.11
        is_secure = qber_value < 0.11
        
        # 7. Final Key Generation (Privacy Amplification)
        final_key = None
        if is_secure:
            final_key = self.engine.generate_shared_key(alice_sifted_bits)
            
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
            "final_hex_key": final_key,
            "job_id": job_id
        }
