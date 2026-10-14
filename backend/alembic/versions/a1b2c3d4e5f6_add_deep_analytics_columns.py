"""Add deep analytics columns to site_visits

Revision ID: a1b2c3d4e5f6
Revises: 043672cc4dff
Create Date: 2026-10-15 03:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '043672cc4dff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add device_type, browser, os_name, referrer_source, current_page to site_visits."""
    op.add_column('site_visits', sa.Column('device_type', sa.String(), nullable=True))
    op.add_column('site_visits', sa.Column('browser', sa.String(), nullable=True))
    op.add_column('site_visits', sa.Column('os_name', sa.String(), nullable=True))
    op.add_column('site_visits', sa.Column('referrer_source', sa.String(), nullable=True))
    op.add_column('site_visits', sa.Column('current_page', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove deep analytics columns."""
    op.drop_column('site_visits', 'current_page')
    op.drop_column('site_visits', 'referrer_source')
    op.drop_column('site_visits', 'os_name')
    op.drop_column('site_visits', 'browser')
    op.drop_column('site_visits', 'device_type')
