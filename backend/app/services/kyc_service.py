import random
import time

class KYCService:
    async def verify_document(self, file_path: str, document_type: str):
        """
        Simulates OCR and MRZ verification.
        In a real scenario, this would call Google Document AI or similar.
        """
        # Simulate processing delay
        time.sleep(1)
        
        # Mock result
        is_valid = random.choice([True, True, True, False]) # 75% success rate
        extracted_data = {
            "document_number": f"DOC-{random.randint(10000, 99999)}",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1990-01-01",
            "expiry_date": "2030-01-01"
        }
        
        return {
            "is_valid": is_valid,
            "extracted_data": extracted_data,
            "confidence_score": 0.95 if is_valid else 0.4
        }

    async def verify_liveness(self, selfie_path: str):
        """
        Simulates liveness detection (iProov/Onfido).
        """
        time.sleep(1)
        return {"is_live": True, "score": 0.98}

    async def match_faces(self, document_path: str, selfie_path: str):
        """
        Simulates face matching between document photo and selfie.
        """
        time.sleep(1)
        return {"match": True, "score": 0.92}

    async def check_government_registry(self, nip: str):
        """
        Simulates checking the National Registry.
        """
        # Mock check
        return {"exists": True, "status": "ACTIVE"}

kyc_service = KYCService()
