import time
import uuid
import math
import statistics
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.schemas.experiments import ExperimentRequest
from app.repositories.experiment_repo import ExperimentRepository
from app.quantum.engine import QuantumEngine
from app.quantum.classical_engine import ClassicalEngine
from app.quantum.qiskit_engine import QiskitEngine
from app.quantum.ibm_engine import IBMQuantumEngine

class BB84ExperimentRunner:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ExperimentRepository(db)
        
    def run_experiment(self, req: ExperimentRequest) -> str:
        """
        Initiates the experiment and returns the experiment_id.
        IBM runs are asynchronous, others are synchronous.
        """
        exp = self.repo.create_experiment(req)
        
        for engine_name in req.engines:
            if engine_name == "classical":
                self._run_local_engine(exp.id, req, "classical", "local_python", ClassicalEngine)
            elif engine_name == "qiskit_aer":
                self._run_local_engine(exp.id, req, "qiskit_aer", "aer_simulator", QiskitEngine)
            elif engine_name == "ibm_quantum":
                self._run_ibm_quantum(exp.id, req)
                
        return exp.id
        
    def _execute_single_trial(self, engine: QuantumEngine, req: ExperimentRequest) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        alice_bits = engine.generate_random_bits(req.number_of_bits)
        alice_bases = engine.generate_random_bases(req.number_of_bits)
        quantum_states = engine.encode(alice_bits, alice_bases)
        
        eve_bases = None
        eve_measured_bits = None
        
        if req.mode == "eve_intercept_resend":
            # Eve intercepts
            eve_bases = engine.generate_random_bases(req.number_of_bits)
            eve_measured_bits = engine.measure(quantum_states, eve_bases)
            # Eve reprepares and sends to Bob
            quantum_states = engine.encode(eve_measured_bits, eve_bases)
            
        bob_bases = engine.generate_random_bases(req.number_of_bits)
        bob_measured_bits = engine.measure(quantum_states, bob_bases)
        
        alice_sifted_bits = engine.sift(alice_bases, bob_bases, alice_bits)
        bob_sifted_bits = engine.sift(alice_bases, bob_bases, bob_measured_bits)
        
        qber = engine.calculate_qber(alice_sifted_bits, bob_sifted_bits)
        
        # Calculate error count
        error_count = sum(1 for a, b in zip(alice_sifted_bits, bob_sifted_bits) if a != b)
        
        end_time = time.perf_counter()
        execution_time_ms = int((end_time - start_time) * 1000)
        
        return {
            "alice_bits": alice_bits,
            "alice_bases": alice_bases,
            "bob_bases": bob_bases,
            "bob_measured_bits": bob_measured_bits,
            "eve_bases": eve_bases,
            "eve_measured_bits": eve_measured_bits,
            "sifted_key_length": len(alice_sifted_bits),
            "error_count": error_count,
            "qber": qber,
            "execution_time_ms": execution_time_ms
        }

    def _run_local_engine(self, experiment_id: str, req: ExperimentRequest, engine_name: str, backend: str, engine_cls):
        result = self.repo.add_result(experiment_id, engine_name, backend=backend)
        
        engine = engine_cls()
        if engine_name == "qiskit_aer" and req.mode == "noise":
            engine.set_noise_model(req.noise_params)
            
        try:
            qbers = []
            total_time = 0
            
            # The last trial's detailed data will be saved
            last_trial_data = None
            
            for _ in range(req.trials):
                trial_data = self._execute_single_trial(engine, req)
                qbers.append(trial_data["qber"])
                total_time += trial_data["execution_time_ms"]
                last_trial_data = trial_data
                
            mean_qber = statistics.mean(qbers)
            std_dev_qber = statistics.stdev(qbers) if len(qbers) > 1 else 0.0
            
            update_data = {
                "status": "COMPLETED",
                "alice_bits": last_trial_data["alice_bits"],
                "alice_bases": last_trial_data["alice_bases"],
                "bob_bases": last_trial_data["bob_bases"],
                "bob_measured_bits": last_trial_data["bob_measured_bits"],
                "eve_bases": last_trial_data["eve_bases"],
                "eve_measured_bits": last_trial_data["eve_measured_bits"],
                "sifted_key_length": last_trial_data["sifted_key_length"],
                "error_count": last_trial_data["error_count"],
                "qber": last_trial_data["qber"],
                "mean_qber": mean_qber,
                "std_dev_qber": std_dev_qber,
                "trial_count": req.trials,
                "execution_time_ms": total_time
            }
            
            self.repo.update_result(result.id, update_data)
            
        except Exception as e:
            self.repo.update_result(result.id, {
                "status": "FAILED",
                "error_message": str(e)
            })
        
    def _run_ibm_quantum(self, experiment_id: str, req: ExperimentRequest):
        engine = IBMQuantumEngine()
        backend_name = engine.backend_name if engine.service else "fake_manila"
        result = self.repo.add_result(experiment_id, "ibm_quantum", backend=backend_name)
        
        # We explicitly exclude IBM from Eve intercept resend to save QPU costs unless it's just a baseline or noise
        if req.mode == "eve_intercept_resend":
            self.repo.update_result(result.id, {
                "status": "FAILED",
                "error_message": "IBM Quantum hardware execution is disabled for Intercept-Resend to prevent excessive QPU usage."
            })
            return

        try:
            from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
            from qiskit_ibm_runtime import SamplerV2
            from qiskit_ibm_runtime.fake_provider import FakeManilaV2
            
            alice_bits = engine.generate_random_bits(req.number_of_bits)
            alice_bases = engine.generate_random_bases(req.number_of_bits)
            quantum_states = engine.encode(alice_bits, alice_bases)
            
            bob_bases = engine.generate_random_bases(req.number_of_bits)
            
            measured_circuits = []
            for qc, basis in zip(quantum_states, bob_bases):
                measured_qc = engine.measure_qubit(qc.copy(), basis)
                measured_circuits.append(measured_qc)
                
            if not engine.service:
                ibm_backend = FakeManilaV2()
            else:
                ibm_backend = engine.service.backend(backend_name)
                
            pm = generate_preset_pass_manager(optimization_level=1, backend=ibm_backend)
            isa_circuits = pm.run(measured_circuits)
            
            sampler = SamplerV2(ibm_backend)
            job = sampler.run(isa_circuits, shots=req.shots)
            
            self.repo.update_result(result.id, {
                "status": "QUEUED",
                "job_id": job.job_id(),
                "alice_bits": alice_bits,
                "alice_bases": alice_bases,
                "bob_bases": bob_bases,
                "trial_count": req.trials # For IBM, trials map to shots naturally in analysis
            })
            
        except Exception as e:
            self.repo.update_result(result.id, {
                "status": "FAILED",
                "error_message": str(e)
            })
