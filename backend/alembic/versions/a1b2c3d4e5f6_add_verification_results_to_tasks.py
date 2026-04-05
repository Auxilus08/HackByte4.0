"""add_verification_results_to_tasks

Revision ID: a1b2c3d4e5f6
Revises: f3e2a1b9c8d7
Create Date: 2026-04-05 06:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'f3e2a1b9c8d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add verification_results JSON column to tasks table."""
    op.add_column('tasks', sa.Column('verification_results', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove verification_results column from tasks table."""
    op.drop_column('tasks', 'verification_results')
