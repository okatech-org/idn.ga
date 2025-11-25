import base64
import os

class EncryptionService:
    def __init__(self):
        # In production, this would connect to a dedicated HSM
        self.mock_hsm_key = os.urandom(32)

    def encrypt_document(self, file_content: bytes, user_id: str):
        """
        Simulates encrypting a document with a DEK (Data Encryption Key)
        wrapped by a KEK (Key Encryption Key) from HSM.
        """
        # 1. Generate DEK
        dek = os.urandom(32)
        
        # 2. Encrypt content (Mock XOR for simplicity in demo)
        encrypted_content = bytes([b ^ dek[i % len(dek)] for i, b in enumerate(file_content)])
        
        # 3. Encrypt DEK with KEK (Mock)
        encrypted_dek = bytes([b ^ self.mock_hsm_key[i % len(self.mock_hsm_key)] for i, b in enumerate(dek)])
        
        return {
            "encrypted_content": encrypted_content,
            "encrypted_dek": base64.b64encode(encrypted_dek).decode('utf-8'),
            "key_id": "hsm-key-v1"
        }

    def decrypt_document(self, encrypted_content: bytes, encrypted_dek_b64: str):
        """
        Simulates decryption.
        """
        # 1. Decrypt DEK
        encrypted_dek = base64.b64decode(encrypted_dek_b64)
        dek = bytes([b ^ self.mock_hsm_key[i % len(self.mock_hsm_key)] for i, b in enumerate(encrypted_dek)])
        
        # 2. Decrypt content
        decrypted_content = bytes([b ^ dek[i % len(dek)] for i, b in enumerate(encrypted_content)])
        
        return decrypted_content

encryption_service = EncryptionService()
