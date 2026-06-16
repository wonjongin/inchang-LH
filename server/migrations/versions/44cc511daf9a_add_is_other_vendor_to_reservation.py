"""add_is_other_vendor_to_reservation

Revision ID: 44cc511daf9a
Revises: 4a558ce79e43
Create Date: 2026-06-16 00:11:08.783265

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '44cc511daf9a'
down_revision: Union[str, Sequence[str], None] = '4a558ce79e43'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('reservation') as batch_op:
        batch_op.add_column(sa.Column('is_other_vendor', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('reservation') as batch_op:
        batch_op.drop_column('is_other_vendor')
