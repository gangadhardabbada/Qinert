from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ExperimentRequest(BaseModel):
    engines: List[str] = Field(..., description="List of engines to run (e.g., ['classical', 'qiskit_aer', 'ibm_quantum'])")
    mode: str = Field("baseline", description="Mode of the experiment: baseline, noise, eve_intercept_resend")
    trials: int = Field(1, ge=1, le=100, description="Number of independent trials to run")
    noise_params: Optional[Dict[str, Any]] = Field(None, description="Optional noise configuration")
    number_of_bits: int = Field(16, ge=1, le=1024, description="Number of bits to exchange")
    shots: int = Field(128, ge=1, le=1024, description="Number of shots (mostly relevant for IBM execution)")
    label: Optional[str] = Field(None, description="Optional label for the experiment")

class ExperimentEngineResult(BaseModel):
    engine: str
    backend: Optional[str]
    status: str
    job_id: Optional[str]
    sifted_key_length: Optional[int]
    error_count: Optional[int]
    qber: Optional[float]
    mean_qber: Optional[float]
    std_dev_qber: Optional[float]
    trial_count: Optional[int]
    execution_time_ms: Optional[int]
    error_message: Optional[str]
    eve_bases: Optional[List[str]]
    eve_measured_bits: Optional[List[int]]

class ExperimentStatusResponse(BaseModel):
    experiment_id: str
    status: str
    label: Optional[str]
    created_at: datetime
    results: List[ExperimentEngineResult]

class ExperimentComparisonResponse(BaseModel):
    experiment_id: str
    label: Optional[str]
    mode: str
    trials: int
    number_of_bits: int
    created_at: datetime
    engines: Dict[str, ExperimentEngineResult]
