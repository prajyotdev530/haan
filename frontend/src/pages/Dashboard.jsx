import { Link } from "react-router-dom";
import { api } from "../api.js";
import { ApplicationLink, EmptyState, Loading, PageHeader, StatusBadge } from "../components.jsx";
import { date, money } from "../format.js";
import useLoad from "../useLoad.js";

export default function Dashboard() {
  const stats = useLoad(api.stats);
  const apps = useLoad(api.applications);

  const metrics = stats.data && [
    ["Total users", stats.data.total_users, ""],
    ["Applications", stats.data.total_applications, ""],
    ["Approved", stats.data.approved, "green"],
    ["Rejected", stats.data.rejected, "red"],
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of users and loan applications." />

      {metrics ? (
        <div className="metrics">
          {metrics.map(([label, value, tone]) => (
            <div className="metric" key={label}>
              <span className="metric-label">
                {tone && <i className={`dot ${tone}`} />}
                {label}
              </span>
              <span className="metric-value">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <Loading error={stats.error} rows={1} />
      )}

      <section className="block">
        <div className="section-head">
          <h2>Recent applications</h2>
        </div>
        {apps.data ? (
          <div className="panel table-panel">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th className="num">Loan amount</th>
                  <th className="num">Tenure</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.data.slice(0, 8).map((a) => (
                  <tr key={a.id}>
                    <td><Link to={`/users/${a.user_id}`} className="cell-link">{a.user_name}</Link></td>
                    <td className="num">{money(a.loan_amount)}</td>
                    <td className="num">{a.tenure} months</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="muted">{date(a.created_at)}</td>
                    <td className="right"><ApplicationLink id={a.id}>View</ApplicationLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apps.data.length === 0 && (
              <EmptyState title="No applications yet">Run a new assessment to create the first one.</EmptyState>
            )}
          </div>
        ) : (
          <Loading error={apps.error} />
        )}
      </section>
    </>
  );
}
