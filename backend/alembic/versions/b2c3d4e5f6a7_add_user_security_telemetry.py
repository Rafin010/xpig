"""Add user security, device, persistent cookie tracker, watch telemetry and clicks columns

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-10-15 04:06:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add telemetry and security columns to users table."""
    op.add_column('users', sa.Column('device_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('browser_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('os_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('cookie_tracker_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('total_clicks', sa.Integer(), server_default='0', nullable=True))
    op.add_column('users', sa.Column('total_watched_videos', sa.Integer(), server_default='0', nullable=True))
    op.add_column('users', sa.Column('total_watch_seconds', sa.BigInteger(), server_default='0', nullable=True))
    op.add_column('users', sa.Column('last_ip', sa.String(), nullable=True))
    op.add_column('users', sa.Column('country', sa.String(), nullable=True))
    op.add_column('users', sa.Column('city', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove telemetry and security columns."""
    op.drop_column('users', 'city')
    op.drop_column('users', 'country')
    op.drop_column('users', 'last_ip')
    op.drop_column('users', 'total_watch_seconds')
    op.drop_column('users', 'total_watched_videos')
    op.drop_column('users', 'total_clicks')
    op.drop_column('users', 'cookie_tracker_id')
    op.drop_column('users', 'os_name')
    op.drop_column('users', 'browser_name')
    op.drop_column('users', 'device_name')
