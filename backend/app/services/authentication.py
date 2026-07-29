"""
Authentication Service Module.

Handles identity verification, mock user management, and cryptographic 
proof generation/verification for the Qinert protocol.
"""
import hmac
import hashlib
from typing import Optional, Dict

from app.repositories.user_repo import UserRepository

class AuthenticationService:
    """
    Service for handling authentication logic, identity verification, 
    and HMAC proof processing.
    """
    
    @staticmethod
    def verify_identity(username: str, user_repo: UserRepository) -> bool:
        """
        Verify that a user exists and is active.
        
        Args:
            username (str): The username requested by the client.
            user_repo (UserRepository): The user repository.
            
        Returns:
            bool: True if the user exists and is active, False otherwise.
        """
        user = user_repo.get_by_username(username)
        if not user:
            return False
        return user.is_active

    @staticmethod
    def generate_hmac_proof(key: str, challenge: str) -> str:
        """
        Generate an HMAC-SHA256 proof (Client-side simulation).
        
        In a real protocol, the client generates this locally using their 
        derived shared secret to prove possession of the key without sending it.
        
        Args:
            key (str): The final shared secret (hex string).
            challenge (str): The random challenge string issued by the server.
            
        Returns:
            str: The hexadecimal HMAC signature.
        """
        # Convert strings to bytes for HMAC processing
        key_bytes = key.encode('utf-8')
        challenge_bytes = challenge.encode('utf-8')
        
        signature = hmac.new(key_bytes, challenge_bytes, hashlib.sha256).hexdigest()
        return signature

    @staticmethod
    def verify_hmac_proof(expected_key: str, challenge: str, provided_proof: str) -> bool:
        """
        Verify an HMAC-SHA256 proof (Server-side).
        
        Args:
            expected_key (str): The final shared secret the server derived.
            challenge (str): The original challenge sent to the client.
            provided_proof (str): The signature provided by the client.
            
        Returns:
            bool: True if the proof matches, False otherwise.
        """
        # Generate what the proof *should* be based on our own key and challenge
        expected_proof = AuthenticationService.generate_hmac_proof(expected_key, challenge)
        
        # Use hmac.compare_digest to prevent timing attacks
        return hmac.compare_digest(expected_proof, provided_proof)
