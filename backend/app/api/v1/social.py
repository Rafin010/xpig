from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.models.social import Comment, Like, Follow
from app.schemas.social import Comment as CommentSchema, CommentCreate, Like as LikeSchema, Follow as FollowSchema

router = APIRouter()

# --- Comments ---

@router.post("/videos/{video_id}/comments", response_model=CommentSchema)
async def create_comment(
    video_id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    user_id = 1 # Mock authenticated user
    comment = Comment(
        video_id=video_id,
        user_id=user_id,
        content=comment_in.content
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment

@router.get("/videos/{video_id}/comments", response_model=List[CommentSchema])
async def list_comments(
    video_id: int,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Comment).where(Comment.video_id == video_id).offset(skip).limit(limit))
    return result.scalars().all()

# --- Likes ---

@router.post("/videos/{video_id}/likes", response_model=LikeSchema)
async def like_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    user_id = 1 # Mock auth
    like = Like(video_id=video_id, user_id=user_id)
    db.add(like)
    try:
        await db.commit()
        await db.refresh(like)
        return like
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="You already liked this video")

from fastapi import APIRouter, Depends, HTTPException, status, Response

@router.delete("/videos/{video_id}/likes", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def unlike_video(
    video_id: int,
    db: AsyncSession = Depends(get_db)
):
    user_id = 1
    result = await db.execute(select(Like).where(Like.video_id == video_id, Like.user_id == user_id))
    like = result.scalars().first()
    if not like:
        raise HTTPException(status_code=404, detail="Like not found")
    await db.delete(like)
    await db.commit()
    return None

# --- Follows ---

@router.post("/users/{following_id}/follow", response_model=FollowSchema)
async def follow_user(
    following_id: int,
    db: AsyncSession = Depends(get_db)
) -> Any:
    follower_id = 1 # Mock auth
    if follower_id == following_id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")
        
    follow = Follow(follower_id=follower_id, following_id=following_id)
    db.add(follow)
    try:
        await db.commit()
        await db.refresh(follow)
        return follow
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="You are already following this user")
