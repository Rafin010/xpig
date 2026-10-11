from fastapi import APIRouter
from app.api.v1 import auth, users, videos, discovery, social, creators, admin, payments, links, storage, analytics, team, sponsors

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(videos.router, prefix="/videos", tags=["videos"])
api_router.include_router(discovery.router, prefix="/discover", tags=["discovery"])
api_router.include_router(social.router, prefix="/social", tags=["social"])
api_router.include_router(creators.router, prefix="/creators", tags=["creators"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(links.router, prefix="/links", tags=["links"])
api_router.include_router(storage.router, prefix="/storage-nodes", tags=["storage"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(team.router, prefix="/team", tags=["team"])
api_router.include_router(sponsors.router, prefix="/sponsors", tags=["sponsors"])
