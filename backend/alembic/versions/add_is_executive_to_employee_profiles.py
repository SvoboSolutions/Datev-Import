"""add is_executive to employee_profiles

Revision ID: add_is_executive_to_employee_profiles
Revises: 0e1b21cbe093
Create Date: 2026-03-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "add_is_executive_to_employee_profiles"
down_revision: Union[str, Sequence[str], None] = "0e1b21cbe093"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employee_profiles",
        sa.Column(
            "is_executive",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("employee_profiles", "is_executive")