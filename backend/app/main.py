from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, resume, interview, roadmap, matcher, voice
from app.core.config import settings
from app.db.database import engine, Base

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"/api/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(resume.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(interview.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(roadmap.router, prefix="/api/roadmaps", tags=["roadmaps"])
app.include_router(matcher.router, prefix="/api/matcher", tags=["matcher"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])

@app.get("/")
def read_root():
    return {"message": "Welcome to NextHire AI Backend"}

