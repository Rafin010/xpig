import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import os
import uuid

class R2Storage:
    def __init__(self):
        # Initialize boto3 client for Cloudflare R2
        if settings.R2_ACCOUNT_ID and settings.R2_ACCESS_KEY_ID:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
                aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                region_name="auto"
            )
        else:
            self.s3_client = None
            print("WARNING: R2 credentials not set in config.")
        
        self.bucket_name = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL.rstrip('/') if settings.R2_PUBLIC_URL else ""

    def upload_file(self, file_path: str, object_name: str = None, content_type: str = "video/mp4") -> str:
        """
        Uploads a file to R2 bucket and returns the public URL.
        """
        if not self.s3_client:
            raise Exception("R2 client not initialized. Check credentials.")

        if object_name is None:
            ext = os.path.splitext(file_path)[1]
            object_name = f"uploads/{uuid.uuid4()}{ext}"

        try:
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                object_name,
                ExtraArgs={'ContentType': content_type}
            )
            return f"{self.public_url}/{object_name}"
        except ClientError as e:
            print(f"Error uploading to R2: {e}")
            raise e

storage_service = R2Storage()
