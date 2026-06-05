from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routes.student_routes import router as student_router
from routes.ai_routes import router as ai_router
from routes.auth_routes import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(student_router)
app.include_router(ai_router)
app.include_router(auth_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
