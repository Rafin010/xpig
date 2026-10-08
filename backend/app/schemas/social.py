from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    video_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class LikeCreate(BaseModel):
    pass

class Like(BaseModel):
    id: int
    video_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FollowCreate(BaseModel):
    pass

class Follow(BaseModel):
    id: int
    follower_id: int
    following_id: int
    created_at: datetime

    class Config:
        from_attributes = True
