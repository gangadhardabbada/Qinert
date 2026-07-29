import secrets
import os
from typing import List, Any, Dict, Optional

from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
from qiskit_ibm_runtime.fake_provider import FakeManilaV2

from app.quantum.engine import QuantumEngine
from app.quantum.sifting import BasisSifter
from app.quantum.qber import QBERCalculator
from app.quantum.shared_key import SharedKeyGenerator

class IBMQuantumEngine(QuantumEngine):
    """
    IBM Quantum Engine using qiskit-ibm-runtime.
    """
    
    def __init__(self, backend_name: str = "ibmq_qasm_simulator", num_qubits: int = 128):
        self.num_qubits = num_qubits
        self.sifter = BasisSifter()
        self.qber_calc = QBERCalculator()
        self.key_gen = SharedKeyGenerator()
        self.backend_name = backend_name
        self.service = None
        self._initialize_service()

    def _initialize_service(self):
        try:
            # Try to initialize from environment variable first, then saved accounts
            token = os.environ.get("QISKIT_IBM_TOKEN")
            if token:
                self.service = QiskitRuntimeService(channel="ibm_quantum", token=token)
            else:
                self.service = QiskitRuntimeService(channel="ibm_quantum")
        except Exception as e:
            print(f"Failed to initialize IBM Quantum Service: {e}")
            self.service = None

    def get_backends(self) -> List[str]:
        if not self.service:
            return ["fake_manila"]
        try:
            backends = self.service.backends(simulator=False, operational=True)
            return [b.name for b in backends]
        except Exception:
            return ["fake_manila"]

    def generate_random_bits(self, num_bits: int) -> List[int]:
        return [secrets.choice([0, 1]) for _ in range(num_bits)]

    def generate_random_bases(self, num_bases: int) -> List[str]:
        return [secrets.choice(["rectilinear", "diagonal"]) for _ in range(num_bases)]

    def prepare_qubit(self, bit: int, basis: str) -> QuantumCircuit:
        qr = QuantumRegister(1, name="q")
        cr = ClassicalRegister(1, name="c")
        qc = QuantumCircuit(qr, cr)
        
        if bit == 1:
            qc.x(0)
            
        if basis == "diagonal":
            qc.h(0)
            
        return qc

    def measure_qubit(self, circuit: QuantumCircuit, basis: str) -> QuantumCircuit:
        if basis == "diagonal":
            circuit.h(0)
            
        circuit.measure(0, 0)
        return circuit

    def encode(self, bits: List[int], bases: List[str]) -> List[QuantumCircuit]:
        return [self.prepare_qubit(bit, basis) for bit, basis in zip(bits, bases)]

    def measure(self, states: List[QuantumCircuit], bases: List[str]) -> List[int]:
        # To satisfy QPS/1.0 synchronous handshake, we simulate locally
        # to generate a valid key immediately.
        from qiskit_aer import AerSimulator
        simulator = AerSimulator()
        measured_bits = []
        for qc, basis in zip(states, bases):
            # Copy circuit so we don't mutate the ones sent to IBM
            measured_qc = self.measure_qubit(qc.copy(), basis)
            result = simulator.run(measured_qc, shots=1).result()
            counts = result.get_counts()
            measured_bit = int(list(counts.keys())[0])
            measured_bits.append(measured_bit)
        return measured_bits
        
    def submit_job(self, states: List[QuantumCircuit], bases: List[str]) -> str:
        """
        Transpiles the circuits and submits a SamplerV2 job.
        Returns the job_id.
        """
        try:
            if not self.service:
                # Use a fake backend for offline demo if no service
                backend = FakeManilaV2()
            else:
                backend = self.service.backend(self.backend_name)
                
            measured_circuits = []
            for qc, basis in zip(states, bases):
                measured_qc = self.measure_qubit(qc.copy(), basis)
                measured_circuits.append(measured_qc)
                
            transpiled_circuits = transpile(measured_circuits, backend=backend, optimization_level=1)
            
            # Use SamplerV2
            sampler = SamplerV2(backend)
            job = sampler.run(transpiled_circuits, shots=1)
            return job.job_id()
            
        except Exception as e:
            print(f"Failed to submit IBM job: {e}")
            import uuid
            return f"failed_job_{uuid.uuid4().hex}"

    def sift(self, alice_bases: List[str], bob_bases: List[str], measured_bits: List[int]) -> List[int]:
        return self.sifter.sift_bits(alice_bases, bob_bases, measured_bits)

    def calculate_qber(self, alice_bits: List[int], bob_bits: List[int]) -> float:
        return self.qber_calc.calculate_qber(alice_bits, bob_bits)

    def generate_shared_key(self, sifted_bits: List[int]) -> str:
        return self.key_gen.generate_hex_key(sifted_bits)
