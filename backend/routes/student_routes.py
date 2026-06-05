from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    StudentCreate,
    StudentUpdate,
    StudentResponse
)
from models import User
from services.auth_service import get_current_user

from services.student_service import (
    create_student_service,
    get_student_service,
    get_all_students_service,
    update_student_service,
    delete_student_service
)

router = APIRouter(tags=["Students"])

@router.post(
    "/student",
    response_model=StudentResponse
)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_student_service(student, db, current_user.id)


@router.get(
    "/student/{student_id}",
    response_model=StudentResponse
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_student_service(student_id, db, current_user.id)


@router.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_all_students_service(db, current_user.id)


@router.put(
    "/student/{student_id}",
    response_model=StudentResponse
)
def update_student(
    student_id: int,
    updated_student: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return update_student_service(student_id, updated_student, db, current_user.id)


@router.delete(
    "/student/{student_id}"
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return delete_student_service(student_id, db, current_user.id)
