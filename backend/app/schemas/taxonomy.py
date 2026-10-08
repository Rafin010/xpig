from pydantic import BaseModel
from typing import Optional, List
from app.schemas.video import Video

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class SearchResult(BaseModel):
    items: List[Video]
    total: int
    page: int
    size: int
