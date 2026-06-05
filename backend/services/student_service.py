from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Student


def create_student_service(student_data, db: Session, owner_id: int):
    student = Student(
        name=student_data.name,
        email=student_data.email,
        course=student_data.course,
        owner_id=owner_id
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


def get_student_service(student_id: int, db: Session, owner_id: int):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Ownership verification check (403 Forbidden)
    if student.owner_id != owner_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access this student record"
        )

    return student


def get_all_students_service(db: Session, owner_id: int):
    return db.query(Student).filter(Student.owner_id == owner_id).all()


def update_student_service(
    student_id: int,
    updated_student,
    db: Session,
    owner_id: int
):
    student = get_student_service(student_id, db, owner_id)

    student.name = updated_student.name
    student.email = updated_student.email
    student.course = updated_student.course

    db.commit()
    db.refresh(student)

    return student


def delete_student_service(student_id: int, db: Session, owner_id: int):
    student = get_student_service(student_id, db, owner_id)

    db.delete(student)
    db.commit()

    return {
        "message": f"Student {student_id} deleted successfully"
    }