from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/info", summary="Get Quantum Engine Info")
async def get_quantum_info():
    """
    Returns information about the currently active Quantum Engine.
    """
    engine_name = settings.QUANTUM_ENGINE.lower()
    if engine_name == "qiskit":
        backend = "Aer Simulator"
    elif engine_name == "ibm_quantum":
        backend = "IBM Quantum Hardware"
    else:
        backend = "Python Classical Random"
        
    return {
        "engine": engine_name,
        "backend": backend,
        "protocol": "BB84"
    }

from pydantic import BaseModel

class EngineUpdateRequest(BaseModel):
    engine: str

@router.post("/engine", summary="Set Quantum Engine")
async def set_quantum_engine(request: EngineUpdateRequest):
    """
    Updates the active Quantum Engine for the server.
    """
    engine_name = request.engine.lower()
    if engine_name not in ["classical", "qiskit", "ibm_quantum"]:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid engine. Must be 'classical', 'qiskit', or 'ibm_quantum'.")
        
    settings.QUANTUM_ENGINE = engine_name
    return {"status": "success", "engine": engine_name}

@router.get("/backends", summary="Get Available IBM Backends")
async def get_ibm_backends():
    if settings.QUANTUM_ENGINE.lower() != "ibm_quantum":
        return {"backends": []}
    
    from app.quantum.ibm_engine import IBMQuantumEngine
    engine = IBMQuantumEngine()
    backends = engine.get_backends()
    return {"backends": backends}

@router.get("/jobs/{job_id}", summary="Get IBM Job Status")
async def get_ibm_job(job_id: str):
    if settings.QUANTUM_ENGINE.lower() != "ibm_quantum":
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="IBM Quantum engine not active")
        
    try:
        from app.quantum.ibm_engine import IBMQuantumEngine
        engine = IBMQuantumEngine()
        if not engine.service:
            return {"job_id": job_id, "status": "FAILED", "error": "No IBM Quantum service"}
            
        job = engine.service.job(job_id)
        status = job.status()
        
        # Map status to Qinert expected strings
        mapped_status = "QUEUED"
        if status.name == "DONE":
            mapped_status = "COMPLETED"
        elif status.name in ["ERROR", "CANCELLED"]:
            mapped_status = status.name
        elif status.name == "RUNNING":
            mapped_status = "RUNNING"
            
        result = {
            "job_id": job_id,
            "status": mapped_status,
        }
        
        if mapped_status == "COMPLETED":
            result["execution_time"] = job.metrics().get("usage", {}).get("quantum_seconds", 0)
            result["qubits_used"] = engine.num_qubits
            result["shots"] = 1
            
        return result
        
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
