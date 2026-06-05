"""
Authentication Routes

Endpoints:
- POST /register - Register new user with secure password hashing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from schemas import UserCreate, AuthResponse, UserResponse, UserLogin, TokenResponse
from services.auth_service import register_user_service, login_user_service


# Create router with /auth prefix
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    **Request Body:**
    ```json
    {
        "username": "mandar",
        "email": "mandar@gmail.com",
        "password": "password123"
    }
    ```
    
    **Success Response (201):**
    ```json
    {
        "message": "User registered successfully",
        "user": {
            "id": 1,
            "username": "mandar",
            "email": "mandar@gmail.com",
            "is_active": true,
            "created_at": "2024-01-15T10:30:00"
        }
    }
    ```
    
    **Error Response (400 - Email already exists):**
    ```json
    {
        "detail": "Email 'mandar@gmail.com' is already registered"
    }
    ```
    
    **Error Response (422 - Validation error):**
    ```json
    {
        "detail": [
            {
                "loc": ["body", "email"],
                "msg": "value is not a valid email address",
                "type": "value_error.email"
            }
        ]
    }
    ```
    """
    
    try:
        # Call service layer to register user
        user = register_user_service(user_create, db)
        
        # Return success response
        return {
            "message": "User registered successfully",
            "user": user
        }
    
    except ValueError as e:
        # Handle business logic errors (e.g., email already exists)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and receive JWT access token.
    
    **Request Body:**
    ```json
    {
        "email": "mandar@gmail.com",
        "password": "password123"
    }
    ```
    
    **Success Response (200):**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYW5kYXJAZ21haWwuY29tIiwiZXhwIjoxNzAyNzAwNjQ3fQ.abc123...",
        "token_type": "bearer"
    }
    ```
    
    **Error Response (401 - Invalid credentials):**
    ```json
    {
        "detail": "Invalid credentials"
    }
    ```
    
    **Error Response (401 - Inactive user):**
    ```json
    {
        "detail": "User account is inactive"
    }
    ```
    
    **Error Response (422 - Validation error):**
    ```json
    {
        "detail": [
            {
                "loc": ["body", "email"],
                "msg": "value is not a valid email address",
                "type": "value_error.email"
            }
        ]
    }
    ```
    
    **How to use the token:**
    - Include in request header: `Authorization: Bearer <access_token>`
    - Token expires after 30 minutes
    - After expiration, user must login again (Phase 3 will add token refresh)
    """
    
    try:
        # Call service layer to authenticate user and get token
        token_data = login_user_service(user_login.email, user_login.password, db)
        
        # Return token response
        return token_data
    
    except ValueError as e:
        # Handle authentication errors (invalid credentials, inactive user)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/login-swagger", response_model=TokenResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Dedicated OAuth2 login endpoint for Swagger UI Authorize button.
    Expects client credentials in form-data.
    """
    try:
        token_data = login_user_service(form_data.username, form_data.password, db)
        return token_data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during swagger login"
        )
