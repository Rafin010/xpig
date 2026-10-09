from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, desc

from app.db.session import get_db
from app.models.video import Video
from app.models.taxonomy import Category, Tag
from app.schemas.taxonomy import Category as CategorySchema, Tag as TagSchema, SearchResult
from app.schemas.video import Video as VideoSchema

router = APIRouter()

@router.get("/categories", response_model=List[CategorySchema])
async def list_categories(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Category).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/tags", response_model=List[TagSchema])
async def list_tags(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(Tag).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/search", response_model=SearchResult)
async def search_videos(
    q: Optional[str] = Query(None, description="Search query string"),
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    category: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Search videos by keyword, filter by category or tag.
    Returns paginated results.
    """
    # For now, return all since we don't have PUBLISHED set everywhere
    stmt = select(Video)
    
    if q:
        stmt = stmt.where(or_(
            Video.title.ilike(f"%{q}%"),
            Video.description.ilike(f"%{q}%")
        ))
        
    if category_id:
        stmt = stmt.filter(Video.categories.any(id=category_id))
        
    if tag_id:
        stmt = stmt.filter(Video.tags.any(id=tag_id))
        
    if category and category != "All":
        # Temporary fallback: filter by title or description matching the category if we don't have DB tags yet
        # Once pipeline is ready we will properly tag them.
        stmt = stmt.where(or_(
            Video.title.ilike(f"%{category}%"),
            Video.description.ilike(f"%{category}%")
        ))
        
    # Apply sorting (newest first for now)
    stmt = stmt.order_by(desc(Video.created_at))
    
    # Eagerly load relationships to prevent MissingGreenlet errors
    from sqlalchemy.orm import selectinload
    stmt = stmt.options(
        selectinload(Video.creator),
        selectinload(Video.sources),
        selectinload(Video.categories),
        selectinload(Video.tags)
    )
    
    # Pagination
    offset = (page - 1) * size
    stmt_paged = stmt.offset(offset).limit(size)
    
    results = await db.execute(stmt_paged)
    videos = results.scalars().all()
    
    # In a real app, you'd do a separate count query or window function
    total = len(videos) # Mock total for now
    
    return SearchResult(
        items=videos,
        total=total,
        page=page,
        size=size
    )
