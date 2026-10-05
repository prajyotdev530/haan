"""Dummy/synthetic users for the demo. Phone numbers and figures are made up."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .engine import run_assessment
from .models import Assessment, AssessmentRuleResult, LoanApplication, User

# (user fields, requested loan amount, tenure in months)
SEED = [
    # Ramesh: high card utilisation + incomplete income proof
    (dict(name="Ramesh Patil", phone="9820010001", location="Thane", occupation="Kirana owner",
          monthly_income=45000, monthly_expenses=22000, existing_emi=3000, credit_score=702,
          credit_card_limit=25000, credit_card_outstanding=20500, income_proof_status="INCOMPLETE"),
     300000, 36),
    # Amit: passes everything
    (dict(name="Amit Kulkarni", phone="9820010002", location="Pune", occupation="Software engineer",
          monthly_income=95000, monthly_expenses=40000, existing_emi=8000, credit_score=768,
          credit_card_limit=150000, credit_card_outstanding=22000, income_proof_status="VERIFIED"),
     400000, 48),
    # Priya: low credit score
    (dict(name="Priya Shah", phone="9820010003", location="Mumbai", occupation="Boutique owner",
          monthly_income=60000, monthly_expenses=28000, existing_emi=4000, credit_score=598,
          credit_card_limit=80000, credit_card_outstanding=15000, income_proof_status="VERIFIED"),
     200000, 36),
    # Neha: high debt/income
    (dict(name="Neha Iyer", phone="9820010004", location="Bengaluru", occupation="Marketing manager",
          monthly_income=50000, monthly_expenses=30000, existing_emi=18000, credit_score=720,
          credit_card_limit=100000, credit_card_outstanding=20000, income_proof_status="VERIFIED"),
     250000, 36),
    # Rahul: passes everything
    (dict(name="Rahul Verma", phone="9820010005", location="Delhi", occupation="Shop owner",
          monthly_income=72000, monthly_expenses=32000, existing_emi=5000, credit_score=735,
          credit_card_limit=120000, credit_card_outstanding=24000, income_proof_status="VERIFIED"),
     300000, 36),
    # Sneha: high card utilisation
    (dict(name="Sneha Deshmukh", phone="9820010006", location="Nashik", occupation="School teacher",
          monthly_income=55000, monthly_expenses=25000, existing_emi=2000, credit_score=690,
          credit_card_limit=60000, credit_card_outstanding=42000, income_proof_status="VERIFIED"),
     150000, 24),
    # Arjun: income proof incomplete
    (dict(name="Arjun Mehta", phone="9820010007", location="Jaipur", occupation="Freelance designer",
          monthly_income=65000, monthly_expenses=30000, existing_emi=3000, credit_score=710,
          credit_card_limit=90000, credit_card_outstanding=18000, income_proof_status="INCOMPLETE"),
     200000, 36),
    # Kavita: passes everything
    (dict(name="Kavita Nair", phone="9820010008", location="Chennai", occupation="Dentist",
          monthly_income=120000, monthly_expenses=50000, existing_emi=12000, credit_score=790,
          credit_card_limit=200000, credit_card_outstanding=30000, income_proof_status="VERIFIED"),
     800000, 60),
]


def seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(User)):
        return
    for fields, amount, tenure in SEED:
        user = User(**fields)
        application = LoanApplication(user=user, loan_amount=amount, tenure=tenure)
        decision, results = run_assessment(user, amount, tenure)
        assessment = Assessment(application=application, decision=decision)
        assessment.rule_results = [AssessmentRuleResult(**vars(r)) for r in results]
        application.status = decision
        db.add_all([user, application, assessment])
    db.commit()
