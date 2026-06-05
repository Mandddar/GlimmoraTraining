from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ============ STUDENT SCHEMAS ============

class StudentCreate(BaseModel):
    name: str
    email: str
    course: str

class StudentUpdate(BaseModel):
    name: str
    email: str
    course: str

class StudentResponse(StudentCreate):
    id: int
    owner_id: Optional[int] = None

    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    recommendation: str


# ============ AUTHENTICATION SCHEMAS ============

class UserCreate(BaseModel):
    """Schema for user registration request"""
    username: str
    email: EmailStr
    password: str

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login request"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (safe - no password)"""
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for token response (will be used in Phase 2)"""
    access_token: str
    token_type: str
    user: UserResponse


class AuthResponse(BaseModel):
    """Schema for registration response"""
    message: str
    user: UserResponse
