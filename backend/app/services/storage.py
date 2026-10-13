import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import os
import uuid

class R2Storage:
    def __init__(self):
        # Initialize boto3 client for Cloudflare R2
        account_id = settings.R2_ACCOUNT_ID or "2f7e5d019e564f5d3bc298bccab24aad"
        access_key_id = settings.R2_ACCESS_KEY_ID or "0c345e506583674f9ffe5fb9ae447d9e"
        secret_access_key = settings.R2_SECRET_ACCESS_KEY or "256fa77d5cd3eb33e49f17a85c87d9617c233c7aa1936610430622d1b05a135b"
        bucket_name = settings.R2_BUCKET_NAME or "xpig-storage-v1"
        public_url = settings.R2_PUBLIC_URL or "https://pub-1080459c8c0a45b9a545f0b3b3fb21c1.r2.dev"

        try:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=access_key_id,
                aws_secret_access_key=secret_access_key,
                region_name="auto"
            )
        except Exception as e:
            self.s3_client = None
            print(f"WARNING: Could not initialize R2 client: {e}")
        
        self.bucket_name = bucket_name
        self.public_url = public_url.rstrip('/')

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
