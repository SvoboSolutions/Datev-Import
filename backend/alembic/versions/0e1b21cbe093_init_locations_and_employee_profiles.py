"""init full schema

Revision ID: 0e1b21cbe093
Revises:
Create Date: 2026-03-16 14:01:21.615849
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0e1b21cbe093"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="user"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("token", sa.String(length=128), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sessions_token"), "sessions", ["token"], unique=True)
    op.create_index(op.f("ix_sessions_user_id"), "sessions", ["user_id"], unique=False)
    op.create_index(op.f("ix_sessions_expires_at"), "sessions", ["expires_at"], unique=False)

    op.create_table(
        "imports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("source_type", sa.String(length=100), nullable=False),
        sa.Column("period", sa.String(length=7), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("error_message", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="EUR"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_type", "period", name="uq_imports_source_period"),
    )
    op.create_index(op.f("ix_imports_source_type"), "imports", ["source_type"], unique=False)
    op.create_index(op.f("ix_imports_period"), "imports", ["period"], unique=False)

    op.create_table(
        "locations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_locations_name"), "locations", ["name"], unique=True)

    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("external_id", sa.String(length=50), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_employees_external_id"), "employees", ["external_id"], unique=True)

    op.create_table(
        "employee_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("location_id", sa.Integer(), nullable=True),
        sa.Column("manager_employee_id", sa.Integer(), nullable=True),
        sa.Column("profession_type", sa.String(length=50), nullable=True),
        sa.Column("org_role", sa.String(length=50), nullable=False, server_default="none"),
        sa.Column("is_executive", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("entry_date", sa.Date(), nullable=True),
        sa.Column("employment_type", sa.String(length=30), nullable=True),
        sa.Column("weekly_hours", sa.Numeric(5, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["location_id"], ["locations.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["manager_employee_id"], ["employees.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_employee_profiles_employee_id"), "employee_profiles", ["employee_id"], unique=True)
    op.create_index(op.f("ix_employee_profiles_location_id"), "employee_profiles", ["location_id"], unique=False)
    op.create_index(op.f("ix_employee_profiles_manager_employee_id"), "employee_profiles", ["manager_employee_id"], unique=False)

    op.create_table(
        "employee_costs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("import_id", sa.Integer(), nullable=False),
        sa.Column("employee_id", sa.Integer(), nullable=False),
        sa.Column("period", sa.String(length=7), nullable=False),
        sa.Column("gross_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("ag_bav_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("subsidy_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("net_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("sv_ag_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("umlage_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("reimb_kk_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("flat_tax_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("reimb_ba_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("reimb_ifsg_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total_cost_wo_reimb", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total_cost", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="EUR"),
        sa.ForeignKeyConstraint(["employee_id"], ["employees.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["import_id"], ["imports.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_employee_costs_employee_id"), "employee_costs", ["employee_id"], unique=False)
    op.create_index(op.f("ix_employee_costs_import_id"), "employee_costs", ["import_id"], unique=False)
    op.create_index(op.f("ix_employee_costs_period"), "employee_costs", ["period"], unique=False)
    op.create_index("ix_employee_costs_employee_period", "employee_costs", ["employee_id", "period"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_employee_costs_employee_period", table_name="employee_costs")
    op.drop_index(op.f("ix_employee_costs_period"), table_name="employee_costs")
    op.drop_index(op.f("ix_employee_costs_import_id"), table_name="employee_costs")
    op.drop_index(op.f("ix_employee_costs_employee_id"), table_name="employee_costs")
    op.drop_table("employee_costs")

    op.drop_index(op.f("ix_employee_profiles_manager_employee_id"), table_name="employee_profiles")
    op.drop_index(op.f("ix_employee_profiles_location_id"), table_name="employee_profiles")
    op.drop_index(op.f("ix_employee_profiles_employee_id"), table_name="employee_profiles")
    op.drop_table("employee_profiles")

    op.drop_index(op.f("ix_employees_external_id"), table_name="employees")
    op.drop_table("employees")

    op.drop_index(op.f("ix_locations_name"), table_name="locations")
    op.drop_table("locations")

    op.drop_index(op.f("ix_imports_period"), table_name="imports")
    op.drop_index(op.f("ix_imports_source_type"), table_name="imports")
    op.drop_table("imports")

    op.drop_index(op.f("ix_sessions_expires_at"), table_name="sessions")
    op.drop_index(op.f("ix_sessions_user_id"), table_name="sessions")
    op.drop_index(op.f("ix_sessions_token"), table_name="sessions")
    op.drop_table("sessions")

    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_table("users")