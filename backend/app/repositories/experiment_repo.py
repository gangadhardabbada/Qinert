from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from app.models.experiment import Experiment, ExperimentResult
from app.schemas.experiments import ExperimentRequest

class ExperimentRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def create_experiment(self, req: ExperimentRequest) -> Experiment:
        db_exp = Experiment(
            id=uuid.uuid4().hex,
            label=req.label,
            mode=req.mode,
            trials=req.trials,
            noise_params=req.noise_params,
            number_of_bits=req.number_of_bits,
            shots=req.shots,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(db_exp)
        self.db.commit()
        self.db.refresh(db_exp)
        return db_exp
        
    def add_result(self, experiment_id: str, engine: str, status: str = "QUEUED", backend: str = None) -> ExperimentResult:
        db_result = ExperimentResult(
            id=uuid.uuid4().hex,
            experiment_id=experiment_id,
            engine=engine,
            status=status,
            backend=backend
        )
        self.db.add(db_result)
        self.db.commit()
        self.db.refresh(db_result)
        return db_result
        
    def update_result(self, result_id: str, updates: dict) -> Optional[ExperimentResult]:
        db_result = self.db.query(ExperimentResult).filter(ExperimentResult.id == result_id).first()
        if not db_result:
            return None
            
        for key, value in updates.items():
            setattr(db_result, key, value)
            
        self.db.commit()
        self.db.refresh(db_result)
        return db_result
        
    def get_experiment(self, experiment_id: str) -> Optional[Experiment]:
        return self.db.query(Experiment).filter(Experiment.id == experiment_id).first()
