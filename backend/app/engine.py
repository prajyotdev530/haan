"""Loan decision engine.

Synthetic demo rules only -- not real Paytm or lender rules. All decision
logic lives here; the frontend just displays what this returns.
"""
from dataclasses import dataclass
from math import floor

MIN_CREDIT_SCORE = 650
MAX_UTILISATION_PCT = 30
MAX_DEBT_RATIO_PCT = 50
DEMO_INTEREST_RATE = 12.0  # % per annum, flat assumption for the demo


@dataclass
class RuleResult:
    rule_name: str
    passed: bool
    actual_value: str
    required_value: str
    explanation: str
    remediation: str | None


def inr(amount: float) -> str:
    """Format a rupee amount with Indian digit grouping, e.g. ₹3,00,000."""
    s = str(int(round(amount)))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        s = ",".join(groups + [tail])
    return f"₹{s}"


def monthly_emi(principal: float, tenure_months: int, annual_rate: float = DEMO_INTEREST_RATE) -> float:
    r = annual_rate / 12 / 100
    n = tenure_months
    if n <= 0:
        return 0.0
    factor = (1 + r) ** n
    return principal * r * factor / (factor - 1)


def principal_for_emi(emi: float, tenure_months: int, annual_rate: float = DEMO_INTEREST_RATE) -> float:
    r = annual_rate / 12 / 100
    factor = (1 + r) ** tenure_months
    return emi * (factor - 1) / (r * factor)


def card_utilisation(limit: int, outstanding: int) -> float:
    if limit <= 0:
        return 0.0
    return outstanding / limit * 100


def _credit_score_rule(user) -> RuleResult:
    passed = user.credit_score >= MIN_CREDIT_SCORE
    if passed:
        explanation = "Credit score meets the minimum for this demo lender."
        remediation = None
    else:
        gap = MIN_CREDIT_SCORE - user.credit_score
        explanation = "The credit score is below the minimum this demo lender accepts."
        remediation = (
            f"Raise the credit score by at least {gap} points to {MIN_CREDIT_SCORE}. "
            "Paying dues on time and lowering outstanding balances helps; then re-assess."
        )
    return RuleResult(
        "Credit Score", passed, str(user.credit_score), f">= {MIN_CREDIT_SCORE}", explanation, remediation
    )


def _utilisation_rule(user) -> RuleResult:
    util = card_utilisation(user.credit_card_limit, user.credit_card_outstanding)
    passed = util <= MAX_UTILISATION_PCT
    if passed:
        explanation = "Credit card usage is within the limit for this demo lender's rule."
        remediation = None
    else:
        target = floor(user.credit_card_limit * MAX_UTILISATION_PCT / 100)
        explanation = "Credit card usage is too high for this demo lender's rule."
        remediation = f"Reduce card outstanding to <= {inr(target)} and re-assess."
    return RuleResult(
        "Credit Card Utilisation",
        passed,
        f"{round(util)}%",
        f"<= {MAX_UTILISATION_PCT}%",
        explanation,
        remediation,
    )


def _income_proof_rule(user) -> RuleResult:
    passed = user.income_proof_status == "VERIFIED"
    if passed:
        explanation = "Income proof has been verified."
        remediation = None
    else:
        explanation = "Income proof is not verified, so the stated income cannot be relied on."
        remediation = "Complete the income proof submission, get it verified, and re-assess."
    return RuleResult(
        "Income Proof",
        passed,
        user.income_proof_status.capitalize(),
        "Verified",
        explanation,
        remediation,
    )


def _debt_ratio_rule(user, loan_amount: int, tenure: int) -> RuleResult:
    new_emi = monthly_emi(loan_amount, tenure)
    obligations = user.existing_emi + new_emi
    ratio = obligations / user.monthly_income * 100 if user.monthly_income > 0 else 100.0
    passed = ratio <= MAX_DEBT_RATIO_PCT
    actual = f"{round(ratio)}% ({inr(obligations)}/month)"
    required = f"<= {MAX_DEBT_RATIO_PCT}% of income"
    if passed:
        explanation = (
            f"Existing EMI plus the new EMI of {inr(new_emi)} stays within the demo debt-to-income limit."
        )
        remediation = None
    else:
        explanation = (
            f"Existing EMI plus the new EMI of {inr(new_emi)} takes too much of the monthly income."
        )
        room = user.monthly_income * MAX_DEBT_RATIO_PCT / 100 - user.existing_emi
        if room <= 0:
            remediation = (
                "Existing EMIs alone already use half of the monthly income. "
                "Pay down existing loans before applying again."
            )
        else:
            max_loan = floor(principal_for_emi(room, tenure) / 1000) * 1000
            remediation = (
                f"Reduce the loan amount to <= {inr(max_loan)} for a {tenure}-month tenure, "
                "or pay down existing EMIs, then re-assess."
            )
    return RuleResult("Debt-to-Income", passed, actual, required, explanation, remediation)


def run_assessment(user, loan_amount: int, tenure: int) -> tuple[str, list[RuleResult]]:
    results = [
        _credit_score_rule(user),
        _utilisation_rule(user),
        _income_proof_rule(user),
        _debt_ratio_rule(user, loan_amount, tenure),
    ]
    decision = "APPROVED" if all(r.passed for r in results) else "REJECTED"
    return decision, results
