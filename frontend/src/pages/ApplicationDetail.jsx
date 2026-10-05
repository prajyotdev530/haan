import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { AssessmentResult, Loading, PageHeader, StatusBadge } from "../components.jsx";
import { dateTime, money } from "../format.js";
import useLoad from "../useLoad.js";

export default function ApplicationDetail() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  const { data: app, error } = useLoad(() => api.application(id), [id, version]);
  const [running, setRunning] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!app) return <Loading error={error} />;

  async function reassess() {
    setRunning(true);
    setActionError(null);
    try {
      await api.assess(id);
      setVersion(version + 1);
    } catch (err) {
      setActionError(err.message);
    }
    setRunning(false);
  }

  const [latest, ...previous] = app.assessments;

  return (
    <>
      <PageHeader
        title={`Application #${app.id}`}
        subtitle={<Link to={`/users/${app.user_id}`}>{app.user_name}</Link>}
        actions={
          <>
            <Link to={`/users/${app.user_id}/edit`} className="btn">Edit user details</Link>
            <button className="btn btn-primary" onClick={reassess} disabled={running}>
              {running ? "Running…" : "Re-assess"}
            </button>
          </>
        }
      />
      {actionError && <div className="notice error-notice" role="alert">{actionError}</div>}

      <div className="metrics summary">
        <div className="metric"><span className="metric-label">Loan amount</span><span className="metric-value sm">{money(app.loan_amount)}</span></div>
        <div className="metric"><span className="metric-label">Tenure</span><span className="metric-value sm">{app.tenure} months</span></div>
        <div className="metric"><span className="metric-label">Status</span><span className="metric-value sm"><StatusBadge status={app.status} /></span></div>
        <div className="metric"><span className="metric-label">Applied</span><span className="metric-value sm">{dateTime(app.created_at)}</span></div>
      </div>

      <section className="block">
        <div className="section-head"><h2>Latest assessment</h2></div>
        {latest ? (
          <AssessmentResult assessment={latest} application={app} />
        ) : (
          <div className="panel"><p className="faint pad">Not assessed yet. Use Re-assess to run the criteria.</p></div>
        )}
      </section>

      {previous.length > 0 && (
        <section className="block">
          <div className="section-head">
            <h2>Assessment history</h2>
            <span className="faint">Re-assessing uses the user's current details. Earlier results are kept.</span>
          </div>
          <div className="history">
            {previous.map((a) => {
              const failed = a.rule_results.filter((r) => !r.passed).map((r) => r.rule_name);
              return (
                <details key={a.id} className="panel history-item">
                  <summary>
                    <StatusBadge status={a.decision} />
                    <span className="strong">{dateTime(a.created_at)}</span>
                    <span className="faint">
                      {failed.length ? `Not met: ${failed.join(", ")}` : "All criteria met"}
                    </span>
                  </summary>
                  <AssessmentResult assessment={a} application={app} />
                </details>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
