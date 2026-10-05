from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(20))
    location: Mapped[str] = mapped_column(String(100))
    occupation: Mapped[str] = mapped_column(String(100), default="")
    monthly_income: Mapped[int] = mapped_column(Integer)
    monthly_expenses: Mapped[int] = mapped_column(Integer)
    existing_emi: Mapped[int] = mapped_column(Integer, default=0)
    credit_score: Mapped[int] = mapped_column(Integer)
    credit_card_limit: Mapped[int] = mapped_column(Integer, default=0)
    credit_card_outstanding: Mapped[int] = mapped_column(Integer, default=0)
    income_proof_status: Mapped[str] = mapped_column(String(20), default="INCOMPLETE")

    applications: Mapped[list["LoanApplication"]] = relationship(
        back_populates="user", order_by="LoanApplication.id.desc()"
    )


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    loan_amount: Mapped[int] = mapped_column(Integer)
    tenure: Mapped[int] = mapped_column(Integer)  # months
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    user: Mapped[User] = relationship(back_populates="applications")
    assessments: Mapped[list["Assessment"]] = relationship(
        back_populates="application", order_by="Assessment.id.desc()"
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("loan_applications.id"))
    decision: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

    application: Mapped[LoanApplication] = relationship(back_populates="assessments")
    rule_results: Mapped[list["AssessmentRuleResult"]] = relationship(
        back_populates="assessment", order_by="AssessmentRuleResult.id"
    )


class AssessmentRuleResult(Base):
    __tablename__ = "assessment_rule_results"

    id: Mapped[int] = mapped_column(primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"))
    rule_name: Mapped[str] = mapped_column(String(100))
    passed: Mapped[bool] = mapped_column(Boolean)
    actual_value: Mapped[str] = mapped_column(String(100))
    required_value: Mapped[str] = mapped_column(String(100))
    explanation: Mapped[str] = mapped_column(Text)
    remediation: Mapped[str | None] = mapped_column(Text, nullable=True)

    assessment: Mapped[Assessment] = relationship(back_populates="rule_results")
