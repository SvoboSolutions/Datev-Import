from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

revision = "add_is_executive_to_employee_profiles"
down_revision = "0e1b21cbe093"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = inspect(bind)

    if not inspector.has_table("employee_profiles"):
        return

    columns = [col["name"] for col in inspector.get_columns("employee_profiles")]

    if "is_executive" not in columns:
        op.add_column(
            "employee_profiles",
            sa.Column(
                "is_executive",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    op.execute(
        """
        UPDATE employee_profiles
        SET org_role = 'none'
        WHERE org_role = 'executive'
          AND is_executive = 0
        """
    )


def downgrade():
    bind = op.get_bind()
    inspector = inspect(bind)

    if not inspector.has_table("employee_profiles"):
        return

    columns = [col["name"] for col in inspector.get_columns("employee_profiles")]

    if "is_executive" in columns:
        with op.batch_alter_table("employee_profiles") as batch_op:
            batch_op.drop_column("is_executive")