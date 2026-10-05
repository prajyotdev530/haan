import { Link } from "react-router-dom";
import { dateTime, money, pretty, titleCase } from "./format.js";

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }) {
  if (!status) return <span className="faint">Not applied</span>;
  const tone = { APPROVED: "green", REJECTED: "red", PENDING: "amber" }[status] || "gray";
  return <span className={`badge ${tone}`}>{titleCase(status)}</span>;
}

export function ProofBadge({ status }) {
  return <span className={`badge ${status === "VERIFIED" ? "green" : "amber"}`}>{titleCase(status)}</span>;
}

export function Loading({ error, rows = 5 }) {
  if (error) {
    return (
      <div className="notice error-notice" role="alert">
        <strong>Something went wrong.</strong> {error}
      </div>
    );
  }
  return (
    <div className="skeleton-wrap" aria-busy="true" aria-label="Loading">
      <div className="skeleton title" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton line" />
      ))}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Row({ label, children }) {
  return (
    <div className="row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function ApplicationLink({ id, children }) {
  return <Link to={`/applications/${id}`}>{children}</Link>;
}

// One stored assessment, laid out as a decision review.
export function AssessmentResult({ assessment, application }) {
  const approved = assessment.decision === "APPROVED";
  const rules = assessment.rule_results;
  const failed = rules.filter((r) => !r.passed);
  const passed = rules.filter((r) => r.passed);

  return (
    <div className="result">
      <div className={`result-head ${approved ? "approved" : "rejected"}`}>
        <div>
          <div className="result-title">{approved ? "Approved" : "Rejected"}</div>
          <p className="result-lead">
            {approved
              ? "This application meets all of the demo lending criteria."
              : "This application does not currently meet the demo lending criteria."}
          </p>
        </div>
        <dl className="result-meta">
          {application && (
            <>
              <div>
                <dt>Loan requested</dt>
                <dd>{money(application.loan_amount)}</dd>
              </div>
              <div>
                <dt>Tenure</dt>
                <dd>{application.tenure} months</dd>
              </div>
            </>
          )}
          <div>
            <dt>Assessed</dt>
            <dd>{dateTime(assessment.created_at)}</dd>
          </div>
        </dl>
      </div>

      {failed.length > 0 && (
        <section className="result-section">
          <div className="section-head">
            <h3>Why it was rejected</h3>
            <span className="faint">
              {failed.length} of {rules.length} criteria not met
            </span>
          </div>
          <div className="finding-list">
            {failed.map((r) => (
              <article className="finding" key={r.id}>
                <div className="finding-top">
                  <h4>{r.rule_name}</h4>
                  <span className="badge red">Failed</span>
                </div>
                <div className="compare">
                  <div>
                    <span className="overline">Current</span>
                    <span className="compare-value">{pretty(r.actual_value)}</span>
                  </div>
                  <div>
                    <span className="overline">Required</span>
                    <span className="compare-value">{pretty(r.required_value)}</span>
                  </div>
                </div>
                <p className="finding-text">{r.explanation}</p>
                <div className="action-note">
                  <span className="overline">Recommended action</span>
                  <p>{pretty(r.remediation)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {passed.length > 0 && (
        <section className="result-section">
          <div className="section-head">
            <h3>{approved ? "Criteria passed" : "Criteria met"}</h3>
            <span className="faint">
              {passed.length} of {rules.length}
            </span>
          </div>
          <table className="plain">
            <thead>
              <tr>
                <th>Criterion</th>
                <th>Current</th>
                <th>Required</th>
                <th className="right">Result</th>
              </tr>
            </thead>
            <tbody>
              {passed.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{r.rule_name}</td>
                  <td>{pretty(r.actual_value)}</td>
                  <td>{pretty(r.required_value)}</td>
                  <td className="right"><span className="badge green">Passed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {failed.length > 0 && (
        <p className="result-foot">
          Once the details above are updated, re-assess the application. Earlier results stay in the
          assessment history.
        </p>
      )}
    </div>
  );
}
