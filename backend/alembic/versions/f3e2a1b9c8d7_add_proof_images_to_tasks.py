"""add_proof_images_to_tasks

Revision ID: f3e2a1b9c8d7
Revises: dc4e0415a6c8
Create Date: 2026-04-05 06:24:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f3e2a1b9c8d7'
down_revision: Union[str, Sequence[str], None] = 'dc4e0415a6c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add proof_images JSON column to tasks table."""
    op.add_column('tasks', sa.Column('proof_images', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove proof_images column from tasks table."""
    op.drop_column('tasks', 'proof_images')
