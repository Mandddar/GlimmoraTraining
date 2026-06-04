from sqlalchemy.orm import Session
from fastapi import HTTPException
from models import Student


def create_student_service(student_data, db: Session):
    student = Student(
        name=student_data.name,
        email=student_data.email,
        course=student_data.course
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


def get_student_service(student_id: int, db: Session):
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student


def get_all_students_service(db: Session):
    return db.query(Student).all()


def update_student_service(
    student_id: int,
    updated_student,
    db: Session
):
    student = get_student_service(student_id, db)

    student.name = updated_student.name
    student.email = updated_student.email
    student.course = updated_student.course

    db.commit()
    db.refresh(student)

    return student


def delete_student_service(student_id: int, db: Session):
    student = get_student_service(student_id, db)

    db.delete(student)
    db.commit()

    return {
        "message": f"Student {student_id} deleted successfully"
    }