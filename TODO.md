# Haan — Simple Phase 1 TODO

## Goal

Build a **new, simple prototype** for Haan.

For this phase, focus only on:

- Admin-style dashboard
- Dummy users
- Add User feature
- User details
- Loan application details
- Simple deterministic loan assessment
- Show why a loan was rejected/approved
- Show what the user can do to improve/re-apply
- Clean, realistic frontend

## Do NOT Build Yet

Do **not** add:

- Authentication / login
- AI / LLM
- Chatbot
- Voice
- Machine learning
- Insurance
- Real Paytm/lender integrations
- Aadhaar / DigiLocker / Account Aggregator integrations
- Complex permissions or roles
- Complex microservices
- Over-engineered architecture

Use **dummy/seed data** for everything.

---

# 1. Frontend

Build a simple admin dashboard.

Suggested pages:

### Dashboard

Show a few simple numbers:

- Total Users
- Total Loan Applications
- Approved
- Rejected

Also show a small recent applications table.

### Users

Show a list of dummy users.

Columns can include:

- Name
- Location
- Income
- Credit Score
- Current Loan Status
- Action

Add an **Add User** button.

### Add User

Simple form for:

- Name
- Phone
- Location
- Monthly Income
- Monthly Expenses
- Existing EMI
- Credit Score
- Credit Card Limit
- Credit Card Outstanding
- Income Proof Status

Save the user.

### User Details

Show:

- Basic information
- Financial information
- Existing loan applications
- Latest assessment
- Reason for rejection/approval

Have a button such as:

**Assess New Loan**

### New Loan Assessment

Simple form:

- Select user
- Loan Amount
- Loan Tenure
- Any other small fields needed by the rules

Button:

**Run Assessment**

After clicking, show the result.

---

# 2. Loan Decision

Keep the decision engine very simple and deterministic.

Example demo rules:

### Rule 1 — Credit Score

Credit score must be >= 650.

### Rule 2 — Credit Card Utilisation

Calculate:

`Outstanding / Credit Limit × 100`

Target: <= 30%.

### Rule 3 — Income Proof

Income proof must be verified.

### Rule 4 — Debt/Income

Keep monthly debt obligations within a reasonable demo threshold, for example <= 50% of monthly income.

These are **synthetic demo rules only**, not real Paytm or lender rules.

---

# 3. Assessment Result

After assessment, clearly show:

### APPROVED

If all blocking rules pass.

OR

### REJECTED

If one or more blocking rules fail.

For every failed rule, show:

- What failed
- Actual value
- Required value
- Simple explanation
- What the user can do next

Example:

**Credit Card Utilisation — Failed**

Current: 82%

Required: <= 30%

**Why:** Your credit card usage is too high for this demo lender's rule.

**What to do:** Reduce outstanding balance to <= ₹7,500 and re-apply/re-assess.

Do not invent a probability of approval.

---

# 4. Ramesh Demo User

Seed the application with a user similar to the hackathon example.

### Ramesh

- Location: Thane
- Occupation: Kirana owner
- Monthly income: Use sensible dummy data
- Credit card limit: ₹25,000
- Credit card outstanding: ₹20,500
- Utilisation: 82%
- Income proof: Incomplete
- Requested loan: ₹3,00,000

The assessment should reject him because of the failed demo rules.

The UI should make the rejection understandable instead of simply showing "Rejected".

Add a simple remediation message:

- Reduce card outstanding to <= ₹7,500
- Complete income proof
- Re-assess the application

---

# 5. Re-Assessment

Keep this simple.

Allow the admin to edit the user's financial information and run the assessment again.

Example:

Ramesh changes:

- Card outstanding: ₹20,500 → ₹7,500
- Income proof: Incomplete → Verified

Run assessment again.

Show the new result.

Keep a basic assessment history so the previous result is not lost.

---

# 6. Backend

Use a simple backend such as:

- FastAPI
- SQLAlchemy
- PostgreSQL

Keep the API structure straightforward.

Basic entities:

### User

- id
- name
- phone
- location
- occupation
- monthly_income
- monthly_expenses
- existing_emi
- credit_score
- credit_card_limit
- credit_card_outstanding
- income_proof_status

### Loan Application

- id
- user_id
- loan_amount
- tenure
- status
- created_at

### Assessment

- id
- application_id
- decision
- created_at

### Assessment Rule Result

- id
- assessment_id
- rule_name
- passed
- actual_value
- required_value
- explanation
- remediation

Keep the database simple. Do not create unnecessary tables.

---

# 7. Basic API

Implement only what the frontend needs.

Examples:

- `GET /users`
- `POST /users`
- `GET /users/{id}`
- `POST /applications`
- `GET /applications`
- `GET /applications/{id}`
- `POST /applications/{id}/assess`
- `GET /applications/{id}/assessments`

The exact endpoint structure can be adjusted if there is a simpler approach.

---

# 8. Frontend Design — IMPORTANT

The frontend should **NOT look AI-generated**.

This is a major requirement.

Make it look like a real, professionally designed but simple fintech/admin product.

### Visual direction

- Minimalistic
- Clean
- Professional
- Practical
- Mostly white/light background
- Subtle borders
- Restrained use of color
- Normal typography
- Comfortable spacing
- Simple tables
- Simple forms
- Clear status badges

### Avoid

- Huge hero headings
- Excessive gradients
- Glassmorphism
- Neon colors
- Excessive rounded cards
- Giant numbers everywhere
- Too many floating cards
- Excessive icons
- Random illustrations
- AI-themed graphics
- Robot/chatbot visuals
- Purple/blue gradient backgrounds
- Overly futuristic styling
- Excessive animations
- Fancy dashboard effects

Do not make every section a card.

Use normal layouts, tables, forms, headings, borders, and whitespace.

The product should look like something a small fintech team actually built for an internal admin tool.

Use a sensible font and consistent font sizes/weights.

Keep the color palette small:

- Dark text
- Light background
- One primary accent color
- Green for approved
- Red for rejected
- Amber for warnings

Do not use colors just for decoration.

---

# 9. Dummy Data

Seed the application with **8 dummy users initially** so the dashboard looks realistic and is ready for a demo.

Use different outcomes and financial profiles:

1. Ramesh — rejected because of high card utilisation + incomplete income proof
2. Amit — passes all rules
3. Priya — rejected because of low credit score
4. Neha — rejected because of high debt/income
5. Rahul — passes all rules
6. Sneha — rejected because of high card utilisation
7. Arjun — rejected because income proof is incomplete
8. Kavita — passes all rules

Use realistic but clearly **dummy/synthetic** values for income, expenses, EMI, credit score, card limit, card outstanding, etc.

Make sure the seeded users appear immediately in the Users page and can be used for loan assessments.

The seed data should cover:
- Approved cases
- Rejected cases
- Different rejection reasons
- Different income levels
- Different credit scores
- Different card utilisation levels
- Different income-proof statuses

This makes the dashboard and assessment flow easy to demonstrate without manually creating users first.


---

# 10. Decision Engine

Put the loan decision logic in one simple, separate service/module.

It should:

1. Receive user + loan data
2. Calculate derived values such as card utilisation and debt ratio
3. Run each rule
4. Store the result of each rule
5. Determine APPROVED or REJECTED
6. Return explanations and remediation steps

The frontend should not contain the actual decision logic.

---

# 11. Acceptance Criteria

The prototype is complete when:

- [ ] App runs locally
- [ ] Dashboard works
- [ ] Dummy users are visible
- [ ] Add User works
- [ ] User details work
- [ ] New loan assessment works
- [ ] Rules are evaluated correctly
- [ ] Rejected applications show clear reasons
- [ ] Approved applications show passed rules
- [ ] Remediation steps are shown
- [ ] User data can be changed
- [ ] Application can be reassessed
- [ ] Previous assessment remains visible
- [ ] UI looks minimal and human-designed
- [ ] No authentication
- [ ] No AI
- [ ] No unnecessary features

## Most Important Principle

**Keep this prototype simple.**

Do not add features that are not required above.

Build the smallest clean working version first. The goal is a convincing functional demo, not a production-scale system.
