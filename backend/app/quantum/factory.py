from app.core.config import settings
from app.quantum.engine import QuantumEngine

def get_quantum_engine() -> QuantumEngine:
    """
    Dependency injection factory to retrieve the currently configured QuantumEngine.
    """
    if settings.QUANTUM_ENGINE.lower() == "qiskit":
        from app.quantum.qiskit_engine import QiskitEngine
        return QiskitEngine()
    elif settings.QUANTUM_ENGINE.lower() == "ibm_quantum":
        from app.quantum.ibm_engine import IBMQuantumEngine
        # Optionally support specific backend from env
        return IBMQuantumEngine()
    else:
        from app.quantum.classical_engine import ClassicalEngine
        return ClassicalEngine()
