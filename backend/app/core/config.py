from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    POSTGRES_USER: str = "idn_user"
    POSTGRES_PASSWORD: str = "idn_password"
    POSTGRES_DB: str = "idn_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"

    MONGO_USER: str = "idn_mongo_user"
    MONGO_PASSWORD: str = "idn_mongo_password"
    MONGO_HOST: str = "localhost"
    MONGO_PORT: str = "27017"
    MONGO_DB: str = "idn_docs"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Keycloak
    KEYCLOAK_URL: str = "http://localhost:8080"
    KEYCLOAK_REALM: str = "idn-realm"
    KEYCLOAK_CLIENT_ID: str = "idn-backend"
    KEYCLOAK_CLIENT_SECRET: str = "your-client-secret"

    class Config:
        env_file = ".env"

settings = Settings()
