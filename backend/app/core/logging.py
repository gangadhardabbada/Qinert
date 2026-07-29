import logging
import sys

def setup_logging() -> None:
    """Configure application-wide logging."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Optional: Suppress overly verbose third-party logs here
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
