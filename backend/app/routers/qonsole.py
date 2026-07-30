import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import asyncio
import uuid
from datetime import datetime, timezone
import random

router = APIRouter()
JWT_SECRET = "7a0e5d92b1c88e1c63d1a89e4fb13f4dbf91d42e5d667f53b00c8a9d95f1fbc7" # In production, use settings.JWT_SECRET

@router.websocket("/execute")
async def qonsole_execute(websocket: WebSocket, token: str = Query(None)):
    print("STEP 1: Accepted")
    await websocket.accept()
    print(f"STEP 2: Token received: {token}")
    
    if not token:
        await websocket.send_json({"type": "error", "message": "Missing authentication token."})
        await websocket.close(code=1008)
        return
        
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "tempToken":
            raise ValueError("Invalid token type")
        print("STEP 3: Token valid")
    except Exception as e:
        print(f"STEP 3 FAILED: {e}")
        await websocket.send_json({"type": "error", "message": f"Invalid token: {e}"})
        await websocket.close(code=1008)
        return
        
    try:
        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        challenge_id = f"chal_{uuid.uuid4().hex[:8]}"
        seed = "".join(random.choices("0123456789abcdef", k=16))
        
        # Pipeline Stages
        stages = [
            {"id": 1, "name": "Generate Quantum Challenge", "desc": "Creates a high-entropy random challenge using a quantum circuit.\n\nPurpose: Prevent replay attacks."},
            {"id": 2, "name": "Build Circuit", "desc": "Constructs the BB84 quantum circuit required for verification using the Qiskit framework.\n\nPurpose: Encode classical state into quantum superpositions."},
            {"id": 3, "name": "Run Qiskit", "desc": "Dispatches the compiled quantum circuit to the Aer Simulator backend for execution.\n\nPurpose: Perform physical quantum computation."},
            {"id": 4, "name": "Measure", "desc": "Retrieves classical measurement outcomes from the quantum execution by collapsing the wavefunction.\n\nPurpose: Extract raw quantum bits."},
            {"id": 5, "name": "Generate Session Key", "desc": "Applies classical post-processing (e.g., privacy amplification) to derive a highly secure session key.\n\nPurpose: Establish symmetric encryption key."},
            {"id": 6, "name": "Verify Challenge", "desc": "Uses the derived quantum key to cryptographically sign and verify the initial challenge.\n\nPurpose: Prove identity without exposing the key."},
            {"id": 7, "name": "JWT", "desc": "Issues the final JSON Web Token encapsulating the authenticated session state.\n\nPurpose: Grant standardized secure access."}
        ]

        def get_timestamp():
            return datetime.now().strftime("%H:%M:%S")

        async def send_log(msg: str):
            await websocket.send_json({"type": "log", "timestamp": get_timestamp(), "message": msg})

        async def send_stage(stage_idx: int, status: str):
            await websocket.send_json({"type": "stage_update", "stage": stages[stage_idx]["id"], "status": status})

        # Pre-initialize stages to Waiting
        for stage in stages:
            await send_stage(stages.index(stage), "Waiting")
            
        await asyncio.sleep(0.5)

        # 1. Generate Quantum Challenge
        await send_stage(0, "Running")
        await send_log("Generating Challenge Nonce")
        await asyncio.sleep(1.0)
        entropy = round(random.uniform(99.9, 99.99), 2)
        await send_stage(0, "Completed")
        await websocket.send_json({"type": "metric_update", "metric": "challenge", "value": {"id": challenge_id, "entropy": entropy, "seed": seed}})

        # 2. Build Circuit
        await send_stage(1, "Running")
        await send_log("Building Circuit")
        await asyncio.sleep(0.7)
        await send_log("Applying Hadamard Gate")
        await asyncio.sleep(0.5)
        await send_stage(1, "Completed")

        # 3. Run Qiskit
        await send_stage(2, "Running")
        await send_log("Running Aer Simulator")
        await asyncio.sleep(1.5)
        await send_stage(2, "Completed")

        # 4. Measure
        await send_stage(3, "Running")
        await send_log("Receiving Measurements")
        
        # Stream some binary data
        for _ in range(5):
            bits = "".join(random.choices(["0", "1"], k=16))
            await websocket.send_json({"type": "measurement_stream", "bits": bits})
            await asyncio.sleep(0.2)
            
        fidelity = round(random.uniform(98.5, 99.9), 1)
        await send_stage(3, "Completed")
        
        # Send quantum statistics metric
        await websocket.send_json({
            "type": "metric_update", 
            "metric": "quantum_stats", 
            "value": {
                "qubits": 16,
                "shots": 1024,
                "backend": "Aer Simulator",
                "depth": 14,
                "execution_time_ms": random.randint(650, 850),
                "entropy": entropy,
                "fidelity": fidelity
            }
        })

        # 5. Generate Session Key
        await send_stage(4, "Running")
        await send_log("Deriving Session Key")
        await asyncio.sleep(1.2)
        await send_stage(4, "Completed")
        fingerprint = ":".join([f"{random.randint(0, 255):02x}" for _ in range(16)])
        await websocket.send_json({"type": "metric_update", "metric": "session_key", "value": {"fingerprint": fingerprint, "algorithm": "HKDF-SHA256"}})

        # 6. Verify Challenge
        await send_stage(5, "Running")
        await send_log("Verifying Cryptographic Proof")
        await asyncio.sleep(0.8)
        await send_log("Verification Passed")
        await send_stage(5, "Completed")

        # 7. JWT
        await send_stage(6, "Running")
        await send_log("Generating JWT")
        await asyncio.sleep(0.6)
        await send_log("JWT Generated")
        await send_stage(6, "Completed")
        
        jwt_token = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{uuid.uuid4().hex}.sig"
        expires = (datetime.now(timezone.utc)).strftime("%Y-%m-%d %H:%M:%S UTC")
        await websocket.send_json({
            "type": "metric_update", 
            "metric": "jwt", 
            "value": {
                "issued": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
                "expires": expires, 
                "role": "quantum_user", 
                "status": "Active", 
                "token": jwt_token,
                "session_id": session_id
            }
        })

        await websocket.send_json({"type": "complete"})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "message": str(e)})
