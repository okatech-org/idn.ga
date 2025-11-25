from fastapi import FastAPI
from app.routers import auth, documents, digital_card, cv, admin
from app.core.middleware import RateLimitMiddleware, AuditMiddleware
from app.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IDN.GA Backend API",
    description="API for Gabon National Digital Identity System",
    version="1.0.0"
)

# Middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(AuditMiddleware)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(digital_card.router, prefix="/api/v1")
app.include_router(cv.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
