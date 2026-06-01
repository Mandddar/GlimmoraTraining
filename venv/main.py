from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Student
from schemas import StudentCreate, StudentResponse, StudentUpdate

app = FastAPI()

Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"message": "Student API Running"}

@app.post("/student", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    
    new_student = Student(
        name=student.name,
        email=student.email,
        course=student.course
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student

@app.get("/student/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    return student

@app.put("/student/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    updated_student: StudentUpdate,
    db: Session = Depends(get_db)
):
    
    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    student.name = updated_student.name
    student.email = updated_student.email
    student.course = updated_student.course

    db.commit()
    db.refresh(student)

    return student

@app.delete("/student/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):

    student = db.query(Student).filter(
        Student.id == student_id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    db.delete(student)
    db.commit()

    return {
        "message": f"Student {student_id} deleted successfully"
    }