import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.api import deps
from app.db.models import User, Roadmap as RoadmapModel
from app.schemas.roadmap import Roadmap as RoadmapSchema, RoadmapCreate
from app.core.config import settings

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

@router.post("/generate", response_model=RoadmapSchema)
def generate_roadmap(
    *,
    db: Session = Depends(deps.get_db),
    roadmap_in: RoadmapCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate a new AI career roadmap for a specific role.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    prompt = f"""
You are an expert AI Career Counselor. 
Generate a comprehensive, step-by-step career roadmap for the following target role: "{roadmap_in.target_role}"

You MUST return the response as a strict JSON object with exactly these keys:
- "roadmap_steps": An array of objects. Each object must have:
    - "title": (string) e.g., "Learn the Basics"
    - "description": (string) A brief paragraph.
    - "duration": (string) e.g., "1-2 Months"
- "skills": An array of strings representing the core technologies or skills to master.
- "projects": An array of objects representing portfolio projects. Each object must have:
    - "name": (string)
    - "description": (string)
- "timeline": A string representing the total estimated time (e.g., "6-8 Months")

Return ONLY the JSON object.
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        content_json = response.text
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str:
            fallback_data = {
                "roadmap_steps": [
                    {"title": "API Quota Exceeded", "description": "Please enable billing.", "duration": "N/A"}
                ],
                "skills": ["API Key Validation"],
                "projects": [{"name": "Fix API Quota", "description": "Add a credit card to Google AI Studio."}],
                "timeline": "N/A"
            }
            content_json = json.dumps(fallback_data)
        else:
            raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")

    db_obj = RoadmapModel(
        owner_id=current_user.id,
        target_role=roadmap_in.target_role,
        content_json=content_json
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[RoadmapSchema])
def read_roadmaps(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all roadmaps for the current user.
    """
    roadmaps = db.query(RoadmapModel).filter(RoadmapModel.owner_id == current_user.id).order_by(RoadmapModel.created_at.desc()).offset(skip).limit(limit).all()
    return roadmaps

@router.delete("/{roadmap_id}", response_model=RoadmapSchema)
def delete_roadmap(
    *,
    db: Session = Depends(deps.get_db),
    roadmap_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a roadmap.
    """
    roadmap = db.query(RoadmapModel).filter(RoadmapModel.id == roadmap_id, RoadmapModel.owner_id == current_user.id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()
    return roadmap
