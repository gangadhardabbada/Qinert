from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db

from app.schemas.experiments import ExperimentRequest, ExperimentStatusResponse, ExperimentComparisonResponse, ExperimentEngineResult
from app.experiments.bb84_experiment import BB84ExperimentRunner
from app.repositories.experiment_repo import ExperimentRepository
from app.experiments.comparison import get_experiment_comparison, sync_ibm_job

router = APIRouter()

@router.post("/bb84", response_model=dict)
def run_experiment(req: ExperimentRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    runner = BB84ExperimentRunner(db)
    
    # We can run it synchronously for classical/aer since they are fast,
    # and IBM submits a job synchronously and polls asynchronously.
    exp_id = runner.run_experiment(req)
    return {"experiment_id": exp_id}

@router.get("/{experiment_id}", response_model=ExperimentStatusResponse)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    repo = ExperimentRepository(db)
    exp = repo.get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    results = []
    for res in exp.results:
        # Check IBM sync
        if res.engine == "ibm_quantum" and res.status in ["QUEUED", "RUNNING"]:
            sync_ibm_job(res, db)
            
        results.append(ExperimentEngineResult(
            engine=res.engine,
            backend=res.backend,
            status=res.status,
            job_id=res.job_id,
            sifted_key_length=res.sifted_key_length,
            error_count=res.error_count,
            qber=res.qber,
            mean_qber=res.mean_qber,
            std_dev_qber=res.std_dev_qber,
            trial_count=res.trial_count,
            execution_time_ms=res.execution_time_ms,
            error_message=res.error_message,
            eve_bases=res.eve_bases,
            eve_measured_bits=res.eve_measured_bits
        ))
        
    # overall status
    statuses = [r.status for r in results]
    if "FAILED" in statuses:
        overall = "FAILED"
    elif "QUEUED" in statuses or "RUNNING" in statuses:
        overall = "RUNNING"
    else:
        overall = "COMPLETED"
        
    return ExperimentStatusResponse(
        experiment_id=exp.id,
        status=overall,
        label=exp.label,
        created_at=exp.created_at,
        results=results
    )

@router.get("/{experiment_id}/comparison", response_model=ExperimentComparisonResponse)
def get_comparison(experiment_id: str, db: Session = Depends(get_db)):
    repo = ExperimentRepository(db)
    exp = repo.get_experiment(experiment_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    data = get_experiment_comparison(exp, db)
    return ExperimentComparisonResponse(**data)
