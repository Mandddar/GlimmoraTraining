"""
Authentication Service Layer

Handles:
- Password hashing and verification
- User registration
- Email uniqueness validation
"""

from passlib.context import CryptContext
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import get_db

from models import User
from schemas import UserCreate, UserResponse


# ============ PASSWORD HASHING CONFIGURATION ============

# Create password hashing context using PBKDF2-SHA256 as the default scheme.
# PBKDF2 does not have bcrypt's 72-byte password limit and is safe for longer passwords.
# Keep bcrypt in the list so any existing bcrypt hashes can still be verified.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256", "bcrypt"],
    deprecated="auto"
)


# ============ PASSWORD HASHING FUNCTIONS ============

def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password (str): Plain text password from user
    
    Returns:
        str: Hashed password (bcrypt format)
    
    Why bcrypt:
    - Slow by design (prevents brute-force attacks)
    - Includes salt by default (prevents rainbow table attacks)
    - Adaptive (can increase cost as hardware improves)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a stored hash.
    
    Args:
        plain_password (str): Password from login request
        hashed_password (str): Password hash from database
    
    Returns:
        bool: True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


# ============ USER REGISTRATION SERVICE ============

def register_user_service(
    user_create: UserCreate,
    db: Session
) -> UserResponse:
    """
    Register a new user with secure password hashing.
    
    Workflow:
    1. Check if email already exists (prevent duplicates)
    2. Hash password securely using bcrypt
    3. Create User object
    4. Save to database
    5. Return user data (excluding password)
    
    Args:
        user_create (UserCreate): User registration data (username, email, password)
        db (Session): Database session
    
    Returns:
        UserResponse: Created user object
    
    Raises:
        ValueError: If email already exists
        IntegrityError: If database constraint is violated
    """
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_create.email).first()
    if existing_user:
        raise ValueError(f"Email '{user_create.email}' is already registered")
    
    # Hash the password
    hashed_password = hash_password(user_create.password)
    
    # Create new user object
    db_user = User(
        username=user_create.username,
        email=user_create.email,
        password=hashed_password,  # Store hashed password, NOT plain text
        is_active=True
    )
    
    try:
        # Save to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return UserResponse.from_orm(db_user)
    
    except IntegrityError as e:
        # Handle database constraint violations
        db.rollback()
        raise ValueError(f"Database error during user creation: {str(e)}")


def get_user_by_email(email: str, db: Session) -> User:
    """
    Retrieve user by email (used for login in Phase 2).
    
    Args:
        email (str): User email
        db (Session): Database session
    
    Returns:
        User: User object or None if not found
    """
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(user_id: int, db: Session) -> User:
    """
    Retrieve user by ID (used for token validation in Phase 2).
    
    Args:
        user_id (int): User ID
        db (Session): Database session
    
    Returns:
        User: User object or None if not found
    """
    return db.query(User).filter(User.id == user_id).first()


# ============ JWT CONFIGURATION ============

from datetime import timedelta, datetime
from jose import JWTError, jwt
import os

# JWT Configuration
# ⚠️ IMPORTANT: Move these to .env file for production
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Explanation:
# 
# SECRET_KEY:
#   - Used to sign and verify JWT tokens
#   - Must be kept secret (never commit to version control)
#   - Should be at least 32 characters for security
#   - In production: Load from .env file, not hardcoded
#   - If leaked, all tokens can be forged
#
# ALGORITHM:
#   - HS256 = HMAC with SHA-256
#   - Symmetric encryption (same key for signing and verification)
#   - Suitable for single-server applications
#   - Alternative: RS256 (asymmetric, for microservices)
#
# ACCESS_TOKEN_EXPIRE_MINUTES:
#   - Token validity period: 30 minutes
#   - After 30 minutes, token expires and user must login again
#   - Balance between security (short expiration) and UX (not too short)
#   - Typical values: 15-60 minutes


# ============ JWT TOKEN CREATION ============

def create_access_token(
    data: dict,
    expires_delta: timedelta = None
) -> str:
    """
    Create a JWT access token.
    
    Workflow:
    1. Receive data (usually {"sub": email})
    2. Calculate expiration time
    3. Add expiration to payload
    4. Encode with SECRET_KEY and ALGORITHM
    5. Return JWT string
    
    Args:
        data (dict): Payload data to encode (usually {"sub": email})
        expires_delta (timedelta, optional): Custom expiration time. 
                                             Defaults to ACCESS_TOKEN_EXPIRE_MINUTES
    
    Returns:
        str: Encoded JWT token
    
    Example:
        >>> token = create_access_token({"sub": "user@email.com"})
        >>> # token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWI..."
    """
    
    # Create a copy of data to avoid modifying original
    to_encode = data.copy()
    
    # Calculate expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration timestamp to payload
    to_encode.update({"exp": expire})
    
    # Encode JWT using SECRET_KEY and ALGORITHM
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


# ============ LOGIN SERVICE ============

def login_user_service(
    email: str,
    password: str,
    db: Session
) -> dict:
    """
    Authenticate user and generate JWT token.
    
    Workflow:
    1. Find user by email
    2. Verify password against stored hash
    3. If password matches, generate JWT token
    4. Return token and token type
    
    Args:
        email (str): User email
        password (str): Plain text password from login request
        db (Session): Database session
    
    Returns:
        dict: {
            "access_token": "eyJhbGciOiJIUzI1NiIs...",
            "token_type": "bearer"
        }
    
    Raises:
        ValueError: If email not found OR password is incorrect
    
    Security Notes:
    - Returns generic "Invalid credentials" error for both cases
    - Prevents user enumeration attacks
    - Attacker cannot determine if email exists or password is wrong
    """
    
    # Step 1: Find user by email
    user = get_user_by_email(email, db)
    
    # Step 2: Check if user exists AND password is correct
    if not user or not verify_password(password, user.password):
        # Intentionally vague error message prevents account enumeration
        raise ValueError("Invalid credentials")
    
    # Step 3: Check if user is active
    if not user.is_active:
        raise ValueError("User account is inactive")
    
    # Step 4: Generate JWT token with user email as subject
    access_token = create_access_token(data={"sub": user.email})
    
    # Step 5: Return token response
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }


# ============ OAUTH2 BEARER & CURRENT USER DEPENDENCY ============

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/login-swagger"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the currently authenticated user from a JWT token.
    Extracted from the Authorization header, validated, and fetched from the DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        # Invalid or expired token
        raise credentials_exception
        
    user = get_user_by_email(email, db)
    if user is None:
        raise credentials_exception
        
    return user
