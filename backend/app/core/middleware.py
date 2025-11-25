from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
import redis
from app.core.config import settings
from app.database import SessionLocal
from app.models.auth_log import AuthLog

# Redis connection for Rate Limiting
redis_client = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        # Simple rate limit: 100 requests per minute
        current = redis_client.get(key)
        
        if current and int(current) > 100:
            raise HTTPException(status_code=429, detail="Too many requests")
            
        pipe = redis_client.pipeline()
        pipe.incr(key, 1)
        pipe.expire(key, 60)
        pipe.execute()
        
        response = await call_next(request)
        return response

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log sensitive actions (e.g., POST /auth, DELETE /documents)
        if request.method in ["POST", "DELETE", "PUT"] and response.status_code < 400:
            # Async logging to DB (simplified here)
            # In production, push to a queue or use background tasks
            pass
            
        return response
