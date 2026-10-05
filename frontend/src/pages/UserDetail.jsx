import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import {
  ApplicationLink,
  AssessmentResult,
  EmptyState,
  Loading,
  PageHeader,
  ProofBadge,
  Row,
  StatusBadge,
} from "../components.jsx";
import { date, money } from "../format.js";
import useLoad from "../useLoad.js";

export default function UserDetail() {
  const { id } = useParams();
  const { data: u, error } = useLoad(() => api.user(id), [id]);
  if (!u) return <Loading error={error} />;

  const latestApp = u.applications[0];
  const latestAssessment = latestApp?.assessments[0];

  return (
    <>
      <PageHeader
        title={u.name}
        subtitle={[u.occupation, u.location].filter(Boolean).join(" · ")}
        actions={
          <>
            <Link to={`/users/${u.id}/edit`} className="btn">Edit details</Link>
            <Link to={`/assess?user=${u.id}`} className="btn btn-primary">Assess new loan</Link>
          </>
        }
      />

      <div className="panel profile">
        <section>
          <h2 className="overline">Personal information</h2>
          <dl>
            <Row label="Name">{u.name}</Row>
            <Row label="Phone">{u.phone}</Row>
            <Row label="Location">{u.location}</Row>
            <Row label="Occupation">{u.occupation || "—"}</Row>
          </dl>
        </section>
        <section>
          <h2 className="overline">Financial profile</h2>
          <dl>
            <Row label="Monthly income">{money(u.monthly_income)}</Row>
            <Row label="Monthly expenses">{money(u.monthly_expenses)}</Row>
            <Row label="Existing EMI">{money(u.existing_emi)}</Row>
            <Row label="Income proof"><ProofBadge status={u.income_proof_status} /></Row>
          </dl>
        </section>
        <section>
          <h2 className="overline">Credit profile</h2>
          <dl>
            <Row label="Credit score"><span className="strong">{u.credit_score}</span></Row>
            <Row label="Card limit">{money(u.credit_card_limit)}</Row>
            <Row label="Card outstanding">{money(u.credit_card_outstanding)}</Row>
            <Row label="Card utilisation">
              <span className="util">
                <span className="util-bar"><span style={{ width: `${Math.min(u.card_utilisation, 100)}%` }} /></span>
                {u.card_utilisation}%
              </span>
            </Row>
          </dl>
        </section>
      </div>

      <section className="block">
        <div className="section-head"><h2>Loan applications</h2></div>
        <div className="panel table-panel">
          {u.applications.length ? (
            <table>
              <thead>
                <tr>
                  <th>Application</th>
                  <th className="num">Loan amount</th>
                  <th className="num">Tenure</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th className="num">Assessments</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {u.applications.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">#{a.id}</td>
                    <td className="num">{money(a.loan_amount)}</td>
                    <td className="num">{a.tenure} months</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="muted">{date(a.created_at)}</td>
                    <td className="num">{a.assessments.length}</td>
                    <td className="right"><ApplicationLink id={a.id}>View</ApplicationLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No loan applications">Use “Assess new loan” to create one.</EmptyState>
          )}
        </div>
      </section>

      <section className="block">
        <div className="section-head">
          <h2>Latest assessment</h2>
          {latestApp && (
            <span className="faint">
              Application #{latestApp.id} ·{" "}
              <ApplicationLink id={latestApp.id}>History and re-assess</ApplicationLink>
            </span>
          )}
        </div>
        {latestAssessment ? (
          <AssessmentResult assessment={latestAssessment} application={latestApp} />
        ) : (
          <div className="panel">
            <EmptyState title="Not assessed yet">Run an assessment to see the decision and reasons here.</EmptyState>
          </div>
        )}
      </section>
    </>
  );
}
