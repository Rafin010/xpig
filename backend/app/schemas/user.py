from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    date_of_birth: str  # e.g., YYYY-MM-DD
    is_cofounder: Optional[bool] = False

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    age_verification_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass
