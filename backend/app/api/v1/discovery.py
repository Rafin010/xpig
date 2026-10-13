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
    seed: Optional[int] = Query(None, description="Session seed for deterministic random shuffle across pagination"),
    sort: Optional[str] = Query("recommended", description="Sorting strategy: recommended, newest, popular"),
    page: int = 1,
    size: int = 24,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Search videos by keyword, filter by category or tag.
    Supports fresh-first prioritized recommendations and dynamic seed-based catalog shuffling.
    Returns paginated results with accurate database total count.
    """
    from sqlalchemy import func, case, desc
    from sqlalchemy.orm import selectinload

    base_conditions = [Video.status == "PUBLISHED", Video.sources.any()]
    
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
            Video.description.ilike(f"%{category}%"),
            Video.categories.any(Category.name.ilike(f"%{category}%"))
        ))

    # 1. Real total count from database
    count_stmt = select(func.count(Video.id))
    if base_conditions:
        count_stmt = count_stmt.where(and_(*base_conditions))
    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    # 2. Query paginated videos with intelligent discovery ordering
    stmt = select(Video)
    if base_conditions:
        stmt = stmt.where(and_(*base_conditions))

    if sort == "newest" or not seed:
        stmt = stmt.order_by(desc(Video.id))
    else:
        # Hybrid Discovery: Top 8 newest uploads pinned at top, all other catalog videos
        # dynamically pseudo-randomly shuffled by session seed for fair distributed exposure.
        newest_subquery = (
            select(Video.id)
            .where(and_(*base_conditions))
            .order_by(desc(Video.id))
            .limit(8)
        )
        newest_ids_res = await db.execute(newest_subquery)
        newest_ids = newest_ids_res.scalars().all()
        min_newest_id = min(newest_ids) if newest_ids else 0

        is_pinned = case((Video.id >= min_newest_id, 0), else_=1)
        pinned_order = case((Video.id >= min_newest_id, Video.id), else_=None).desc()
        
        # Pure cryptographic pseudo-random hash across whole catalog: overflow-safe and uniform
        random_hash = func.md5(func.concat(Video.id, ':', seed)).desc()
        stmt = stmt.order_by(is_pinned, pinned_order, random_hash)
    
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
