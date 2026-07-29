from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.models.base import Base

class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(String, primary_key=True, index=True, default=lambda: uuid.uuid4().hex)
    label = Column(String, nullable=True)
    number_of_bits = Column(Integer, nullable=False)
    shots = Column(Integer, nullable=False)
    mode = Column(String, default="baseline")
    trials = Column(Integer, default=1)
    noise_params = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    results = relationship("ExperimentResult", back_populates="experiment", cascade="all, delete-orphan")


class ExperimentResult(Base):
    __tablename__ = "experiment_results"
    
    id = Column(String, primary_key=True, index=True, default=lambda: uuid.uuid4().hex)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    engine = Column(String, nullable=False)
    backend = Column(String, nullable=True)
    status = Column(String, nullable=False, default="QUEUED")  # QUEUED, RUNNING, COMPLETED, FAILED
    job_id = Column(String, nullable=True)
    
    # Baseline Metrics
    alice_bits = Column(JSON, nullable=True)
    alice_bases = Column(JSON, nullable=True)
    bob_bases = Column(JSON, nullable=True)
    bob_measured_bits = Column(JSON, nullable=True)
    sifted_key_length = Column(Integer, nullable=True)
    error_count = Column(Integer, nullable=True)
    qber = Column(Float, nullable=True)
    
    # Eve Metrics
    eve_bases = Column(JSON, nullable=True)
    eve_measured_bits = Column(JSON, nullable=True)
    
    # Multi-trial Metrics
    trial_count = Column(Integer, default=1)
    mean_qber = Column(Float, nullable=True)
    std_dev_qber = Column(Float, nullable=True)
    
    execution_time_ms = Column(Integer, nullable=True)
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    experiment = relationship("Experiment", back_populates="results")
