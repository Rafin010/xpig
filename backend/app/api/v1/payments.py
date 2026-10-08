from typing import Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models.payment import Subscription, Transaction
from app.schemas.payment import Subscription as SubscriptionSchema, SubscriptionCreate, PaymentWebhookPayload

router = APIRouter()

@router.post("/subscribe", response_model=SubscriptionSchema)
async def create_subscription(
    sub_in: SubscriptionCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Initiate a subscription to a creator.
    In production, this would return a checkout URL for CCBill/Paxum.
    For this demo, we immediately activate the subscription.
    """
    subscriber_id = 1 # Mock authenticated user
    
    # Check if active subscription already exists
    stmt = select(Subscription).where(
        Subscription.subscriber_id == subscriber_id,
        Subscription.creator_id == sub_in.creator_id,
        Subscription.status == "ACTIVE"
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You are already subscribed to this creator")
        
    # Mocking 30 days of subscription
    end_date = datetime.utcnow() + timedelta(days=30)
    
    sub = Subscription(
        subscriber_id=subscriber_id,
        creator_id=sub_in.creator_id,
        status="ACTIVE",
        current_period_end=end_date
    )
    
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub


@router.post("/webhook/gateway")
async def payment_gateway_webhook(
    payload: PaymentWebhookPayload,
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Webhook to receive asynchronous payment confirmations from CCBill, Epoch, etc.
    MUST verify signatures in production.
    """
    # 1. Verify webhook signature (Skipped for demo)
    
    # 2. Record transaction
    transaction = Transaction(
        user_id=payload.subscriber_id,
        creator_id=payload.creator_id,
        amount=payload.amount,
        currency=payload.currency,
        gateway_transaction_id=payload.transaction_id,
        payment_method=payload.payment_method,
        status=payload.status
    )
    db.add(transaction)
    
    # 3. Provision or revoke access based on status
    if payload.status == "SUCCESS":
        # Extend subscription logic here
        pass
        
    await db.commit()
    return {"status": "Webhook received and processed"}
