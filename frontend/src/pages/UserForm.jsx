import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { Loading, PageHeader } from "../components.jsx";
import useLoad from "../useLoad.js";

const EMPTY = {
  name: "",
  phone: "",
  location: "",
  occupation: "",
  monthly_income: "",
  monthly_expenses: "",
  existing_emi: "0",
  credit_score: "",
  credit_card_limit: "0",
  credit_card_outstanding: "0",
  income_proof_status: "INCOMPLETE",
};

const NUMBER_FIELDS = [
  "monthly_income",
  "monthly_expenses",
  "existing_emi",
  "credit_score",
  "credit_card_limit",
  "credit_card_outstanding",
];

// Used for both "Add user" (/users/new) and editing an existing user.
export default function UserForm() {
  const { id } = useParams();
  const existing = useLoad(() => (id ? api.user(id) : Promise.resolve(null)), [id]);
  if (id && !existing.data) return <Loading error={existing.error} />;
  return <Form id={id} initial={existing.data} />;
}

function Form({ id, initial }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() =>
    initial ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String(initial[k])])) : EMPTY
  );
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { ...form };
    NUMBER_FIELDS.forEach((k) => (body[k] = Number(form[k])));
    try {
      const saved = id ? await api.updateUser(id, body) : await api.createUser(body);
      navigate(`/users/${saved.id}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const field = (key, label, { hint, prefix, required = true, ...input } = {}) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <div className={prefix ? "control has-prefix" : "control"}>
        {prefix && <span className="affix">{prefix}</span>}
        <input id={key} value={form[key]} onChange={set(key)} required={required} {...input} />
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
  const money = (key, label, opts) => field(key, label, { type: "number", min: 0, prefix: "₹", ...opts });

  return (
    <>
      <PageHeader
        title={id ? `Edit ${initial.name}` : "Add user"}
        subtitle={
          id
            ? "Changes apply the next time an application is assessed."
            : "Enter the applicant's details. All values are demo data."
        }
      />
      <form onSubmit={submit} className="panel form-panel">
        <fieldset>
          <legend>Personal information</legend>
          <div className="grid">
            {field("name", "Full name")}
            {field("phone", "Phone", { type: "tel" })}
            {field("location", "Location")}
            {field("occupation", "Occupation", { required: false })}
          </div>
        </fieldset>
        <fieldset>
          <legend>Financial profile</legend>
          <div className="grid">
            {money("monthly_income", "Monthly income")}
            {money("monthly_expenses", "Monthly expenses")}
            {money("existing_emi", "Existing EMI", { hint: "Total EMI paid each month on current loans." })}
            <div className="field">
              <label htmlFor="income_proof_status">Income proof status</label>
              <div className="control">
                <select id="income_proof_status" value={form.income_proof_status} onChange={set("income_proof_status")}>
                  <option value="INCOMPLETE">Incomplete</option>
                  <option value="VERIFIED">Verified</option>
                </select>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Credit profile</legend>
          <div className="grid">
            {field("credit_score", "Credit score", { type: "number", min: 300, max: 900, hint: "Between 300 and 900." })}
            {money("credit_card_limit", "Credit card limit")}
            {money("credit_card_outstanding", "Credit card outstanding")}
          </div>
        </fieldset>
        {error && <div className="notice error-notice" role="alert">{error}</div>}
        <div className="form-footer">
          <Link to={id ? `/users/${id}` : "/users"} className="btn">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : id ? "Save changes" : "Save user"}
          </button>
        </div>
      </form>
    </>
  );
}
