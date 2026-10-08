from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SubscriptionBase(BaseModel):
    creator_id: int

class SubscriptionCreate(SubscriptionBase):
    pass

class Subscription(SubscriptionBase):
    id: int
    subscriber_id: int
    status: str
    current_period_start: datetime
    current_period_end: datetime

    class Config:
        from_attributes = True

class PaymentWebhookPayload(BaseModel):
    transaction_id: str
    amount: float
    currency: str
    subscriber_id: int
    creator_id: int
    status: str
    payment_method: str
