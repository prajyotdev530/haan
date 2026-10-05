from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from . import schemas
from .database import Base, SessionLocal, engine, get_db
from .engine import DEMO_INTEREST_RATE, card_utilisation, monthly_emi, run_assessment
from .models import Assessment, AssessmentRuleResult, LoanApplication, User
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Haan", lifespan=lifespan)


def assess_application(db: Session, application: LoanApplication) -> Assessment:
    """Run the decision engine, store the result and update the application status."""
    decision, results = run_assessment(application.user, application.loan_amount, application.tenure)
    assessment = Assessment(application_id=application.id, decision=decision)
    assessment.rule_results = [AssessmentRuleResult(**vars(r)) for r in results]
    db.add(assessment)
    application.status = decision
    db.commit()
    db.refresh(assessment)
    return assessment


def user_out(user: User) -> dict:
    latest = user.applications[0] if user.applications else None
    return {
        **{c: getattr(user, c) for c in schemas.UserIn.model_fields},
        "id": user.id,
        "card_utilisation": round(card_utilisation(user.credit_card_limit, user.credit_card_outstanding)),
        "current_loan_status": latest.status if latest else None,
    }


def application_out(app_: LoanApplication) -> dict:
    return {
        "id": app_.id,
        "user_id": app_.user_id,
        "user_name": app_.user.name,
        "loan_amount": app_.loan_amount,
        "tenure": app_.tenure,
        "status": app_.status,
        "created_at": app_.created_at,
    }


def application_detail(app_: LoanApplication) -> dict:
    return {**application_out(app_), "assessments": app_.assessments}


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


def get_application_or_404(db: Session, application_id: int) -> LoanApplication:
    application = db.get(LoanApplication, application_id)
    if not application:
        raise HTTPException(404, "Application not found")
    return application


# ---- Users ----

@app.get("/api/users", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    users = db.scalars(select(User).options(selectinload(User.applications)).order_by(User.id)).all()
    return [user_out(u) for u in users]


@app.post("/api/users", response_model=schemas.UserOut, status_code=201)
def create_user(body: schemas.UserIn, db: Session = Depends(get_db)):
    user = User(**body.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user_out(user)


@app.get("/api/users/{user_id}", response_model=schemas.UserDetail)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_or_404(db, user_id)
    return {**user_out(user), "applications": [application_detail(a) for a in user.applications]}


@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, body: schemas.UserIn, db: Session = Depends(get_db)):
    user = get_user_or_404(db, user_id)
    for field, value in body.model_dump().items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user_out(user)


# ---- Applications ----

@app.get("/api/applications", response_model=list[schemas.ApplicationOut])
def list_applications(db: Session = Depends(get_db)):
    apps = db.scalars(
        select(LoanApplication).options(selectinload(LoanApplication.user)).order_by(LoanApplication.id.desc())
    ).all()
    return [application_out(a) for a in apps]


@app.post("/api/applications", response_model=schemas.ApplicationOut, status_code=201)
def create_application(body: schemas.ApplicationIn, db: Session = Depends(get_db)):
    get_user_or_404(db, body.user_id)
    application = LoanApplication(**body.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application_out(application)


@app.get("/api/applications/{application_id}", response_model=schemas.ApplicationDetail)
def get_application(application_id: int, db: Session = Depends(get_db)):
    return application_detail(get_application_or_404(db, application_id))


@app.post("/api/applications/{application_id}/assess", response_model=schemas.AssessmentOut)
def assess(application_id: int, db: Session = Depends(get_db)):
    return assess_application(db, get_application_or_404(db, application_id))


@app.get("/api/applications/{application_id}/assessments", response_model=list[schemas.AssessmentOut])
def list_assessments(application_id: int, db: Session = Depends(get_db)):
    return get_application_or_404(db, application_id).assessments


# ---- Dashboard ----

@app.get("/api/stats", response_model=schemas.Stats)
def stats(db: Session = Depends(get_db)):
    def count_status(status: str) -> int:
        return db.scalar(select(func.count()).select_from(LoanApplication).where(LoanApplication.status == status))

    return {
        "total_users": db.scalar(select(func.count()).select_from(User)),
        "total_applications": db.scalar(select(func.count()).select_from(LoanApplication)),
        "approved": count_status("APPROVED"),
        "rejected": count_status("REJECTED"),
    }


# ---- EMI estimate (display only; same formula the engine uses) ----

@app.get("/api/emi")
def emi_estimate(amount: int, tenure: int):
    if amount <= 0 or tenure <= 0:
        raise HTTPException(422, "amount and tenure must be positive")
    return {"emi": round(monthly_emi(amount, tenure)), "annual_rate": DEMO_INTEREST_RATE}
