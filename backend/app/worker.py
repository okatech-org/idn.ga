from celery import Celery
from app.core.config import settings
import time

celery_app = Celery(
    "worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.task_routes = {
    "app.worker.process_document_upload": "main-queue",
    "app.worker.verify_kyc": "kyc-queue",
    "app.worker.regenerate_expired_qr_codes": "qr-queue",
}

@celery_app.task(name="app.worker.process_document_upload")
def process_document_upload(document_id: str):
    """
    Simulates async document processing: Encryption -> OCR -> AI Classification.
    """
    print(f"Processing document {document_id}...")
    time.sleep(2) # Simulate work
    # In real app: call encryption_service, ai_service, etc.
    print(f"Document {document_id} processed successfully.")
    return {"status": "processed", "document_id": document_id}

@celery_app.task(name="app.worker.verify_kyc")
def verify_kyc(user_id: str):
    """
    Simulates async KYC verification.
    """
    print(f"Verifying KYC for user {user_id}...")
    time.sleep(3)
    # In real app: call kyc_service
    print(f"KYC for user {user_id} completed.")
    return {"status": "verified", "user_id": user_id}

@celery_app.task(name="app.worker.regenerate_expired_qr_codes")
def regenerate_expired_qr_codes():
    """
    Periodic task to regenerate QR codes.
    """
    print("Regenerating expired QR codes...")
    # Logic to find expired codes and regenerate
    return "Done"
