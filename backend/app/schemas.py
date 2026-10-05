from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=1, max_length=20)
    location: str = Field(min_length=1, max_length=100)
    occupation: str = ""
    monthly_income: int = Field(ge=0)
    monthly_expenses: int = Field(ge=0)
    existing_emi: int = Field(ge=0, default=0)
    credit_score: int = Field(ge=300, le=900)
    credit_card_limit: int = Field(ge=0, default=0)
    credit_card_outstanding: int = Field(ge=0, default=0)
    income_proof_status: Literal["VERIFIED", "INCOMPLETE"] = "INCOMPLETE"


class RuleResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rule_name: str
    passed: bool
    actual_value: str
    required_value: str
    explanation: str
    remediation: str | None


class AssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    application_id: int
    decision: str
    created_at: datetime
    rule_results: list[RuleResultOut]


class ApplicationIn(BaseModel):
    user_id: int
    loan_amount: int = Field(gt=0)
    tenure: int = Field(gt=0, le=120)


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    loan_amount: int
    tenure: int
    status: str
    created_at: datetime


class ApplicationDetail(ApplicationOut):
    assessments: list[AssessmentOut]


class UserOut(UserIn):
    id: int
    card_utilisation: int
    current_loan_status: str | None


class UserDetail(UserOut):
    applications: list[ApplicationDetail]


class Stats(BaseModel):
    total_users: int
    total_applications: int
    approved: int
    rejected: int
