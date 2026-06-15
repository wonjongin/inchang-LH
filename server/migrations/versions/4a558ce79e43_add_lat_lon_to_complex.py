"""add_lat_lon_to_complex

Revision ID: 4a558ce79e43
Revises: 5cb538b798cc
Create Date: 2026-06-15 21:44:32.273396

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a558ce79e43'
down_revision: Union[str, Sequence[str], None] = '5cb538b798cc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('complex', sa.Column('lat', sa.Float(), nullable=True))
    op.add_column('complex', sa.Column('lon', sa.Float(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('complex', 'lon')
    op.drop_column('complex', 'lat')
