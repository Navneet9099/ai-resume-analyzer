from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.utils.auth import decode_token

# We point oauth2_scheme to the login endpoint.
# auto_error=False allows us to manually handle cases where the header is missing.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
        
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_CREDENTIALS_INVALID, # 401
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_CREDENTIALS_INVALID,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_CREDENTIALS_INVALID,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
