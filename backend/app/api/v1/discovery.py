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
    size: int = 24,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Search videos by keyword, filter by category or tag.
    Returns paginated results with accurate database total count.
    """
    from sqlalchemy import func
    from sqlalchemy.orm import selectinload

    base_conditions = []
    
    if q:
        base_conditions.append(or_(
            Video.title.ilike(f"%{q}%"),
            Video.description.ilike(f"%{q}%")
        ))
        
    if category_id:
        base_conditions.append(Video.categories.any(id=category_id))
        
    if tag_id:
        base_conditions.append(Video.tags.any(id=tag_id))
        
    if category and category != "All":
        base_conditions.append(or_(
            Video.title.ilike(f"%{category}%"),
            Video.description.ilike(f"%{category}%")
        ))

    # 1. Real total count from database
    count_stmt = select(func.count(Video.id))
    if base_conditions:
        count_stmt = count_stmt.where(and_(*base_conditions))
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    # 2. Query paginated videos (ordered by ID descending so newest videos appear first)
    stmt = select(Video)
    if base_conditions:
        stmt = stmt.where(and_(*base_conditions))

    stmt = stmt.order_by(desc(Video.id))
    
    # Eagerly load relationships to prevent MissingGreenlet errors
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
    
    return SearchResult(
        items=videos,
        total=total,
        page=page,
        size=size
    )
