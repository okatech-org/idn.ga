import jwt
import qrcode
import io
import base64
from datetime import datetime, timedelta

class QRService:
    def __init__(self):
        self.secret = "qr-secret-key" # Should be in env

    def generate_dynamic_qr(self, user_id: str):
        """
        Generates a signed JWT token for the QR code and returns the QR image as base64.
        Token expires in 5 minutes.
        """
        expiration = datetime.utcnow() + timedelta(minutes=5)
        
        payload = {
            "sub": str(user_id),
            "exp": expiration,
            "type": "digital_id_qr",
            "jti": base64.b64encode(os.urandom(16)).decode('utf-8')
        }
        
        token = jwt.encode(payload, self.secret, algorithm="HS256")
        
        # Generate QR Image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(token)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {
            "token": token,
            "image_base64": img_str,
            "expires_at": expiration
        }

    def verify_qr_token(self, token: str):
        """
        Verifies the QR token.
        """
        try:
            payload = jwt.decode(token, self.secret, algorithms=["HS256"])
            return {"valid": True, "user_id": payload["sub"]}
        except jwt.ExpiredSignatureError:
            return {"valid": False, "error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"valid": False, "error": "Invalid token"}

import os
qr_service = QRService()
