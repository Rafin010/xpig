from arq.connections import RedisSettings
from app.worker.tasks import process_video_task

class WorkerSettings:
    """
    Settings for the ARQ worker.
    To run: `arq app.worker.main.WorkerSettings`
    """
    functions = [process_video_task]
    
    # In production, use environment variables: REDIS_HOST, REDIS_PORT
    redis_settings = RedisSettings(host='localhost', port=6379)
    
    async def on_startup(ctx):
        print("Worker starting up...")

    async def on_shutdown(ctx):
        print("Worker shutting down...")
