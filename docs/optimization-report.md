# Qinert Performance Optimization Report

This report identifies potential performance bottlenecks and provides actionable recommendations to optimize the Qinert authentication system for high-throughput production environments without altering the fundamental QPS/1.0 protocol behavior.

---

## 1. Database & SQLAlchemy Optimization
**Current State:** Qinert uses synchronous SQLAlchemy (`Session`) and PostgreSQL for managing users, sessions, and experiment results.
**Bottlenecks & Recommendations:**
- **Asynchronous ORM:** The most significant bottleneck is the use of synchronous database drivers (e.g., `psycopg2`). Every DB query blocks the FastAPI event loop. 
  - *Action:* Migrate to SQLAlchemy 2.0's AsyncIO extension using `asyncpg` and `AsyncSession`. This will vastly improve request concurrency.
- **Indexing:** High-read queries, particularly in `SessionRepository` (looking up `session_id`) and `UserRepository` (looking up `username` or `client_id`), may slow down as the database grows.
  - *Action:* Ensure explicit BTREE indexes exist on `sessions.token`, `sessions.client_id`, and `users.username`.
- **Connection Pooling:** 
  - *Action:* Tune SQLAlchemy's `pool_size` and `max_overflow` to match the Uvicorn worker count, and use a tool like PgBouncer for database-level connection multiplexing.

## 2. FastAPI & API Optimization
**Current State:** Standard FastAPI routing with synchronous dependencies.
**Bottlenecks & Recommendations:**
- **Blocking I/O:** Endpoints that call `db.commit()` or execute quantum simulations synchronously block the thread.
  - *Action:* Ensure any computationally heavy tasks (like `ClassicalEngine` BB84 simulation loops) are pushed to a `ThreadPoolExecutor` or `ProcessPoolExecutor` using `run_in_threadpool` or `asyncio.to_thread()`, freeing the main loop to accept new requests.
- **Polling overhead:** The Experimental Lab UI polls `/api/v1/experiments/{id}` heavily to check IBM job completion.
  - *Action:* Migrate experiment status updates to Server-Sent Events (SSE) or WebSockets. This eliminates HTTP overhead and reduces polling load on the server.

## 3. Caching Opportunities
**Current State:** Authentication challenges and nonces are stored in the PostgreSQL database.
**Bottlenecks & Recommendations:**
- **Ephemeral State in DB:** Writing a challenge to Postgres only to read it and delete it 5 seconds later during proof verification causes unnecessary I/O and WAL (Write-Ahead Logging) bloat.
  - *Action:* Implement Redis for caching ephemeral state. Store the `client_id -> challenge` mapping in Redis with a strict 60-second TTL (`EX` flag). This provides sub-millisecond lookups for the `/verify` endpoint.

## 4. Quantum Execution Optimization
**Current State:** The `BB84ExperimentRunner` iterates through trials sequentially.
**Bottlenecks & Recommendations:**
- **Sequential Local Trials:** Running 50 trials of `QiskitEngine` executes one after another.
  - *Action:* Use `asyncio.gather` or `concurrent.futures.ProcessPoolExecutor` to run local simulation trials in parallel across available CPU cores.
- **Qiskit Aer Overhead:** The `AerSimulator` is instantiated frequently.
  - *Action:* Cache or reuse the `AerSimulator` instance (and compiled noise models) across trials instead of rebuilding them per request.
- **IBM Job Syncing:** `sync_ibm_job` in `comparison.py` makes synchronous network requests to the IBM Cloud API.
  - *Action:* Push IBM job status checks to a background worker (e.g., Celery or arq) and use Webhooks/SSE to notify the frontend, rather than blocking the comparison API endpoint.

## 5. React & Bundle Optimization
**Current State:** A standard React SPA built with Vite.
**Bottlenecks & Recommendations:**
- **Monolithic Bundle:** If Framer Motion, HeroUI, and any charting libraries (like Recharts/Chart.js) are bundled together, initial load times may suffer.
  - *Action:* Implement React Code Splitting using `React.lazy()` and `Suspense`. Lazy load the `ExperimentalLab` and `BB84Workbench` routes so users simply logging in don't download heavy data visualization dependencies.
- **Re-renders during polling:** The React state might be re-rendering the entire Experimental Lab table every 2 seconds during IBM hardware execution.
  - *Action:* Memoize heavy chart components and table rows using `React.memo` to ensure they only re-render when their specific row data changes.

## 6. Memory Optimization
**Current State:** `qiskit` and `numpy` arrays are used for quantum state tracking.
**Bottlenecks & Recommendations:**
- **Memory Spikes:** High `number_of_bits` (e.g., 10,000+) across concurrent requests will spike RAM usage. Python lists are memory-inefficient for large bitstrings.
  - *Action:* Migrate from Python native lists to `numpy.array` with `dtype=np.int8` for all bit and basis tracking in the `ClassicalEngine` and `QiskitEngine`.

## 7. Concurrency Improvements Summary
To achieve true production throughput for QPS/1.0 authentications:
1. Move from Postgres to Redis for Challenge/Nonce storage.
2. Upgrade SQLAlchemy to `ext.asyncio`.
3. Offload all computationally heavy BB84 simulations (even classical) to a `ProcessPoolExecutor`.
4. Switch frontend status checks from HTTP Polling to WebSockets/SSE.
