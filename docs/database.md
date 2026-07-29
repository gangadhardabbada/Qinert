# Database Architecture

## Technology
Qinert utilizes **PostgreSQL**, currently hosted on **Neon**, for robust, scalable relational data storage.

## ORM and Migrations
- **SQLAlchemy 2.0**: Used for object-relational mapping, ensuring type safety and pythonic database interactions.
- **Alembic**: Manages incremental database schema changes (migrations).

## Data Models

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ AUTH_LOGS : generates
    
    USERS {
        int id
        string username
        string password_hash
        string client_id
    }
    
    SESSIONS {
        int id
        int user_id
        string token
        datetime expires_at
        boolean is_active
    }
    
    AUTH_LOGS {
        int id
        int user_id
        string status
        string ip_address
        datetime timestamp
    }
    
    EXPERIMENTS ||--o{ EXPERIMENT_RESULTS : contains
    
    EXPERIMENTS {
        string id
        string mode
        int trials
        int number_of_bits
    }
    
    EXPERIMENT_RESULTS {
        string id
        string experiment_id
        string engine
        string status
        float qber
    }
```

## Constraints and Security
- Passwords are never stored in plaintext; they are hashed using bcrypt.
- Sessions are uniquely tracked via secure tokens and include explicit expiration timestamps.
- Raw shared quantum keys are **never** persisted in the database, ensuring forward secrecy.
