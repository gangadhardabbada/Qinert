from app.models.experiment import ExperimentResult
from app.quantum.sifting import BasisSifter
from app.quantum.qber import QBERCalculator
from app.quantum.ibm_engine import IBMQuantumEngine
from typing import Dict, Any

def sync_ibm_job(result: ExperimentResult, db):
    """
    Checks the status of the IBM job and updates the DB if finished.
    """
    if result.engine != "ibm_quantum" or result.status not in ["QUEUED", "RUNNING"]:
        return
        
    try:
        engine = IBMQuantumEngine()
        if not engine.service:
            return
            
        job = engine.service.job(result.job_id)
        status = job.status().name
        
        if status == "DONE":
            result.status = "COMPLETED"
            
            # Retrieve results
            job_result = job.result()
            
            # Unpack counts
            # SamplerV2 returns PubResult which has DataBin.
            # Measurements are typically in job_result[i].data.c.get_counts()
            
            measured_bits = []
            for i in range(len(result.alice_bits)):
                counts = job_result[i].data.c.get_counts()
                # Most frequent measurement
                bit_str = max(counts, key=counts.get)
                measured_bits.append(int(bit_str))
                
            result.bob_measured_bits = measured_bits
            
            # Sift and calculate QBER
            sifter = BasisSifter()
            alice_sifted = sifter.sift_bits(result.alice_bases, result.bob_bases, result.alice_bits)
            bob_sifted = sifter.sift_bits(result.alice_bases, result.bob_bases, measured_bits)
            
            qber_calc = QBERCalculator()
            result.qber = qber_calc.calculate_qber(alice_sifted, bob_sifted)
            result.sifted_key_length = len(alice_sifted)
            
            metrics = job.metrics()
            result.execution_time_ms = int(metrics.get("usage", {}).get("quantum_seconds", 0) * 1000)
            
            db.commit()
            
        elif status in ["ERROR", "CANCELLED"]:
            result.status = "FAILED"
            result.error_message = f"Job {status}"
            db.commit()
            
        elif status == "RUNNING":
            if result.status != "RUNNING":
                result.status = "RUNNING"
                db.commit()
                
    except Exception as e:
        print(f"Failed to sync IBM job {result.job_id}: {e}")

def get_experiment_comparison(exp, db) -> Dict[str, Any]:
    engines = {}
    for res in exp.results:
        # Check IBM sync
        if res.engine == "ibm_quantum" and res.status in ["QUEUED", "RUNNING"]:
            sync_ibm_job(res, db)
            
        engines[res.engine] = {
            "engine": res.engine,
            "backend": res.backend,
            "status": res.status,
            "job_id": res.job_id,
            "sifted_key_length": res.sifted_key_length,
            "error_count": res.error_count,
            "qber": res.qber,
            "mean_qber": res.mean_qber,
            "std_dev_qber": res.std_dev_qber,
            "trial_count": res.trial_count,
            "execution_time_ms": res.execution_time_ms,
            "error_message": res.error_message,
            "eve_bases": res.eve_bases,
            "eve_measured_bits": res.eve_measured_bits
        }
        
    return {
        "experiment_id": exp.id,
        "label": exp.label,
        "mode": exp.mode,
        "trials": exp.trials,
        "number_of_bits": exp.number_of_bits,
        "created_at": exp.created_at,
        "engines": engines
    }
