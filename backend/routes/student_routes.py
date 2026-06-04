from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    StudentCreate,
    StudentUpdate,
    StudentResponse
)

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
    db: Session = Depends(get_db)
):
    return create_student_service(student, db)


@router.get(
    "/student/{student_id}",
    response_model=StudentResponse
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    return get_student_service(student_id, db)


@router.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    db: Session = Depends(get_db)
):
    return get_all_students_service(db)


@router.put(
    "/student/{student_id}",
    response_model=StudentResponse
)
def update_student(
    student_id: int,
    updated_student: StudentUpdate,
    db: Session = Depends(get_db)
):
    return update_student_service(student_id, updated_student, db)


@router.delete(
    "/student/{student_id}"
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    return delete_student_service(student_id, db)
