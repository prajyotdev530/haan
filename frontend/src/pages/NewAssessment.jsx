import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { AssessmentResult, Loading, PageHeader, ProofBadge, Row } from "../components.jsx";
import { money } from "../format.js";
import useLoad from "../useLoad.js";

export default function NewAssessment() {
  const [params] = useSearchParams();
  const { data: users, error } = useLoad(api.users);
  const [userId, setUserId] = useState(params.get("user") || "");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("36");
  const [emi, setEmi] = useState(null);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState(null);
  const [running, setRunning] = useState(false);
  const resultRef = useRef(null);

  // EMI estimate comes from the backend so the formula lives in one place.
  useEffect(() => {
    setEmi(null);
    if (!(Number(amount) > 0 && Number(tenure) > 0)) return;
    let stale = false;
    api.emi(Number(amount), Number(tenure)).then((r) => !stale && setEmi(r)).catch(() => {});
    return () => { stale = true; };
  }, [amount, tenure]);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  if (!users) return <Loading error={error} />;
  const user = users.find((u) => String(u.id) === String(userId));

  async function run(e) {
    e.preventDefault();
    setRunning(true);
    setFormError(null);
    try {
      const application = await api.createApplication({
        user_id: Number(userId),
        loan_amount: Number(amount),
        tenure: Number(tenure),
      });
      const assessment = await api.assess(application.id);
      setResult({ application, assessment });
    } catch (err) {
      setFormError(err.message);
    }
    setRunning(false);
  }

  return (
    <>
      <PageHeader
        title="New loan assessment"
        subtitle="Run the demo lending criteria against a loan request."
      />

      <div className="split">
        <form onSubmit={run} className="panel form-panel">
          <fieldset>
            <legend>Loan request</legend>
            <div className="field">
              <label htmlFor="user">User</label>
              <div className="control">
                <select
                  id="user"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setResult(null); }}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} — {u.location}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid">
              <div className="field">
                <label htmlFor="amount">Loan amount</label>
                <div className="control has-prefix">
                  <span className="affix">₹</span>
                  <input id="amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="3,00,000" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="tenure">Tenure</label>
                <div className="control has-suffix">
                  <input id="tenure" type="number" min="1" max="120" value={tenure} onChange={(e) => setTenure(e.target.value)} required />
                  <span className="affix">months</span>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="estimate">
            <div>
              <span className="overline">Estimated EMI</span>
              <span className="estimate-value">{emi ? `${money(emi.emi)} / month` : "—"}</span>
            </div>
            <p>Calculated at a flat {emi?.annual_rate ?? 12}% a year for this demo. Not a lender quote.</p>
          </div>

          {formError && <div className="notice error-notice" role="alert">{formError}</div>}
          <div className="form-footer">
            <button type="submit" className="btn btn-primary btn-lg" disabled={running}>
              {running ? "Running…" : "Run assessment"}
            </button>
          </div>
        </form>

        <aside className="panel snapshot">
          <h2 className="overline">Applicant snapshot</h2>
          {user ? (
            <>
              <div className="snapshot-name">{user.name}</div>
              <div className="cell-sub">{[user.occupation, user.location].filter(Boolean).join(" · ")}</div>
              <dl>
                <Row label="Monthly income">{money(user.monthly_income)}</Row>
                <Row label="Existing EMI">{money(user.existing_emi)}</Row>
                <Row label="Credit score">{user.credit_score}</Row>
                <Row label="Card utilisation">{user.card_utilisation}%</Row>
                <Row label="Income proof"><ProofBadge status={user.income_proof_status} /></Row>
              </dl>
              <Link to={`/users/${user.id}/edit`} className="snapshot-link">Edit details</Link>
            </>
          ) : (
            <p className="faint">Select a user to see their current financial details.</p>
          )}
        </aside>
      </div>

      {result && (
        <section className="block" ref={resultRef}>
          <div className="section-head">
            <h2>Assessment result</h2>
            <span className="faint">
              {user?.name} · Application #{result.application.id} ·{" "}
              <Link to={`/applications/${result.application.id}`}>Open application</Link>
            </span>
          </div>
          <AssessmentResult assessment={result.assessment} application={result.application} />
        </section>
      )}
    </>
  );
}
