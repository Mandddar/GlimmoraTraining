from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100))
    course = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)