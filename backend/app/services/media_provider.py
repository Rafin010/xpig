from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class MediaProvider(ABC):
    @abstractmethod
    async def validate_source(self, url_or_id: str) -> bool:
        """Validate if the source is accessible and authorized."""
        pass
    
    @abstractmethod
    async def get_metadata(self, url_or_id: str) -> Dict[str, Any]:
        """Extract metadata (duration, resolution, etc.)."""
        pass
    
    @abstractmethod
    async def get_playback_url(self, url_or_id: str) -> str:
        """Get the streamable or download URL."""
        pass
    
    @abstractmethod
    async def get_thumbnail(self, url_or_id: str) -> Optional[str]:
        """Get a thumbnail image if available."""
        pass
        
    @abstractmethod
    async def disable_asset(self, url_or_id: str) -> bool:
        """Disable or remove the asset (for moderation/takedown)."""
        pass

class SelfHostedProvider(MediaProvider):
    async def validate_source(self, object_key: str) -> bool:
        # Implement S3 / Object storage validation
        return True
        
    async def get_metadata(self, object_key: str) -> Dict[str, Any]:
        return {"duration": 0, "resolution": "1080p"}
        
    async def get_playback_url(self, object_key: str) -> str:
        return f"https://cdn.pig.example.com/{object_key}"
        
    async def get_thumbnail(self, object_key: str) -> Optional[str]:
        return f"https://cdn.pig.example.com/thumbnails/{object_key}.jpg"
        
    async def disable_asset(self, object_key: str) -> bool:
        # Move object or change permissions
        return True
