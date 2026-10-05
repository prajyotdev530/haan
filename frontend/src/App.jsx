import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Users from "./pages/Users.jsx";
import UserForm from "./pages/UserForm.jsx";
import UserDetail from "./pages/UserDetail.jsx";
import NewAssessment from "./pages/NewAssessment.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";

export default function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span className="brand-name">Haan</span>
        </div>
        <div className="nav-label">Lending</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/assess">New assessment</NavLink>
        </nav>
        <div className="sidebar-foot">
          <strong>Demo environment</strong>
          Synthetic data and demo rules only.
        </div>
      </aside>
      <main className="content">
        <div className="content-inner">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            <Route path="/assess" element={<NewAssessment />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
