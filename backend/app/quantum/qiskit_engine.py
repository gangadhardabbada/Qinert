import secrets
from typing import List, Any, Dict

from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator

from app.quantum.engine import QuantumEngine
from app.quantum.sifting import BasisSifter
from app.quantum.qber import QBERCalculator
from app.quantum.shared_key import SharedKeyGenerator

class QiskitEngine(QuantumEngine):
    """
    Qiskit-based implementation of the QuantumEngine.
    Uses Aer Simulator to execute actual quantum circuits for BB84.
    """
    
    def __init__(self, num_qubits: int = 1024):
        self.num_qubits = num_qubits
        self.simulator = AerSimulator()
        self.sifter = BasisSifter()
        self.qber_calc = QBERCalculator()
        self.key_gen = SharedKeyGenerator()
        self.noise_model = None

    def set_noise_model(self, noise_params: Dict[str, Any]):
        """Configures the simulator with a specific noise model"""
        from qiskit_aer.noise import NoiseModel, depolarizing_error, ReadoutError
        
        self.noise_model = NoiseModel()
        
        if not noise_params:
            return
            
        # Example noise parameters
        meas_err_rate = noise_params.get("measurement_error_rate", 0.0)
        gate_err_rate = noise_params.get("single_qubit_gate_error", 0.0)
        
        if meas_err_rate > 0:
            ro_err = ReadoutError([[1 - meas_err_rate, meas_err_rate], [meas_err_rate, 1 - meas_err_rate]])
            self.noise_model.add_all_qubit_readout_error(ro_err)
            
        if gate_err_rate > 0:
            dep_err = depolarizing_error(gate_err_rate, 1)
            self.noise_model.add_all_qubit_quantum_error(dep_err, ['u1', 'u2', 'u3', 'x', 'h'])
            
        # Re-initialize simulator with noise
        self.simulator = AerSimulator(noise_model=self.noise_model)

    def generate_random_bits(self, num_bits: int) -> List[int]:
        """Generates classical random bits using cryptographically secure RNG."""
        return [secrets.choice([0, 1]) for _ in range(num_bits)]

    def generate_random_bases(self, num_bases: int) -> List[str]:
        """Generates classical random bases."""
        return [secrets.choice(["rectilinear", "diagonal"]) for _ in range(num_bases)]

    def prepare_qubit(self, bit: int, basis: str) -> QuantumCircuit:
        """
        Creates a QuantumCircuit preparing the state based on the bit and basis.
        """
        qr = QuantumRegister(1, name="q")
        cr = ClassicalRegister(1, name="c")
        qc = QuantumCircuit(qr, cr)
        
        # 1 bit -> apply X gate (pauli-X) to flip from |0> to |1>
        if bit == 1:
            qc.x(0)
            
        # diagonal basis -> apply H gate (Hadamard) to change basis
        if basis == "diagonal":
            qc.h(0)
            
        return qc

    def measure_qubit(self, circuit: QuantumCircuit, basis: str) -> QuantumCircuit:
        """
        Applies measurement in the given basis to the circuit.
        """
        if basis == "diagonal":
            circuit.h(0)
            
        circuit.measure(0, 0)
        return circuit

    def encode(self, bits: List[int], bases: List[str]) -> List[QuantumCircuit]:
        """
        Encodes the classical bits into a list of quantum circuits.
        """
        return [self.prepare_qubit(bit, basis) for bit, basis in zip(bits, bases)]

    def measure(self, states: List[QuantumCircuit], bases: List[str]) -> List[int]:
        """
        Measures the list of quantum circuits in the provided bases using Aer Simulator.
        """
        measured_bits = []
        for qc, basis in zip(states, bases):
            measured_qc = self.measure_qubit(qc, basis)
            
            # Execute on simulator
            result = self.simulator.run(measured_qc, shots=1).result()
            counts = result.get_counts()
            
            # Since shots=1, counts will have exactly one key, e.g. '0' or '1'
            measured_bit = int(list(counts.keys())[0])
            measured_bits.append(measured_bit)
            
        return measured_bits

    def sift(self, alice_bases: List[str], bob_bases: List[str], measured_bits: List[int]) -> List[int]:
        return self.sifter.sift_bits(alice_bases, bob_bases, measured_bits)

    def calculate_qber(self, alice_bits: List[int], bob_bits: List[int]) -> float:
        return self.qber_calc.calculate_qber(alice_bits, bob_bits)

    def generate_shared_key(self, sifted_bits: List[int]) -> str:
        return self.key_gen.generate_hex_key(sifted_bits)

    def execute_bb84(self, simulate_eavesdropper: bool = False) -> Dict[str, Any]:
        """
        Executes a complete BB84 exchange independently.
        Useful helper wrapper returning identical dictionary to BB84Protocol.
        """
        from app.quantum.protocol import BB84Protocol
        protocol = BB84Protocol(engine=self, num_qubits=self.num_qubits)
        return protocol.execute_exchange(simulate_eavesdropper=simulate_eavesdropper)
