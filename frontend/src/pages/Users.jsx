import { Link } from "react-router-dom";
import { api } from "../api.js";
import { EmptyState, Loading, PageHeader, StatusBadge } from "../components.jsx";
import { money } from "../format.js";
import useLoad from "../useLoad.js";

export default function Users() {
  const { data, error } = useLoad(api.users);

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={data ? `${data.length} applicants on file.` : "Applicants and their current loan status."}
        actions={<Link to="/users/new" className="btn btn-primary">Add user</Link>}
      />
      {data ? (
        <div className="panel table-panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th className="num">Monthly income</th>
                <th className="num">Credit score</th>
                <th>Current status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link to={`/users/${u.id}`} className="cell-link">{u.name}</Link>
                    {u.occupation && <div className="cell-sub">{u.occupation}</div>}
                  </td>
                  <td>{u.location}</td>
                  <td className="num">{money(u.monthly_income)}</td>
                  <td className="num">{u.credit_score}</td>
                  <td><StatusBadge status={u.current_loan_status} /></td>
                  <td className="right"><Link to={`/users/${u.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <EmptyState title="No users yet">Add a user to get started.</EmptyState>}
        </div>
      ) : (
        <Loading error={error} />
      )}
    </>
  );
}
