from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.ai_service import generate_recommendation
from services.student_service import get_student_service
from schemas import RecommendationResponse
from models import User
from services.auth_service import get_current_user

router = APIRouter(tags=["AI"])

@router.post(
    "/student/{student_id}/recommendation",
    response_model=RecommendationResponse
)
def get_recommendation(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_service(student_id, db, current_user.id)
    recommendation = generate_recommendation(student)
    return {"recommendation": recommendation}
