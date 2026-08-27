// pages/admin/units/create.js
// Form to create a new unit and set its constraints

import { useState }  from 'react';
import { useRouter } from 'next/router';
import Head          from 'next/head';
import Link          from 'next/link';

/**
 * @function CreateUnitPage
 * Builds TeamUp's Create Unit page using react.js
 * @returns Create Unit page HTML
 */
export default function CreateUnitPage() {
  /**
   * @const router
   * @const form
   * @const error
   * @const loading
   */
  const router = useRouter();

  // Form state with default constraint values
  const [form, setForm] = useState({
    unit_code: '',
    unit_name: '',
    semester:  '',
    min_size:  4,
    max_size:  5,
    max_new:   2,
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * @function handleChange
   * Update form state when input changes
   * @param {*} e react event
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  /**
   * @function handleSubmit
   * Submit the form to create a unit.
   * @param {*} e react event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/units', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        ...form,
        min_size: Number(form.min_size),
        max_size: Number(form.max_size),
        max_new:  Number(form.max_new),
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) { router.push('/admin/units'); }
    else        { setError(data.error || 'Failed to create unit.'); }
  }

  return (
    <>
      <Head><title>TeamUp — Create Unit</title></Head>

      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/admin/units" className="anav-link anav-button">← Back to units</Link>
      </nav>

      <div className="acontainer-sm">
        <h1 className="apage-title">Create Unit</h1>
        <p className="apage-sub">Set up a new unit and configure its group formation constraints</p>

        <form onSubmit={handleSubmit} className="aform-card">
          {error && <div className="aerror-box">{error}</div>}

          <div className="asection-label">Unit Details</div>

          <div className="afield">
            <label>Unit Code</label>
            <input name="unit_code" placeholder="e.g. IFB398" value={form.unit_code} onChange={handleChange} required style={{textTransform:'uppercase'}} />
            <span className="ahint">Must be unique — e.g. IFB398, CAB302</span>
          </div>

          <div className="afield">
            <label>Unit Name</label>
            <input name="unit_name" placeholder="e.g. Capstone Project A" value={form.unit_name} onChange={handleChange} required />
          </div>

          <div className="afield">
            <label>Semester</label>
            <input name="semester" placeholder="e.g. Semester 1 2026" value={form.semester} onChange={handleChange} required />
          </div>

          <div className="adivider" />

          <div className="asection-label">Group Formation Constraints</div>
          <p className="asection-desc">These rules will be enforced when students form groups in this unit.</p>

          <div className="afields-row">
            <div className="afield">
              <label>Min group size</label>
              <input type="number" name="min_size" value={form.min_size} onChange={handleChange} min={2} max={10} required />
            </div>
            <div className="afield">
              <label>Max group size</label>
              <input type="number" name="max_size" value={form.max_size} onChange={handleChange} min={2} max={10} required />
            </div>
            <div className="afield">
              <label>Max new students</label>
              <input type="number" name="max_new" value={form.max_new} onChange={handleChange} min={0} max={10} required />
              <span className="ahint">Spreads new students across groups</span>
            </div>
          </div>

          <div className="aconstraints-preview">
            <div className="apreview-label">Constraint preview</div>
            <div className="apreview-tags">
              <span className="aconstraint-tag">👥 {form.min_size}–{form.max_size} members per group</span>
              <span className="aconstraint-tag">🎓 Max {form.max_new} new students per group</span>
              <span className="aconstraint-tag">🗓 1+ shared tutorial slot required</span>
            </div>
          </div>

          <div className="abtn-row">
            <button className="abtn abtn-blue" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create unit'}
            </button>
            <Link href="/admin/units" className="abtn abtn-ghost">Cancel</Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .anav { display:flex; align-items:center; justify-content:space-between; padding:16px 32px; border-bottom:1px solid #30363D; background:#161B22; }
        .anav-logo { font-size:20px; font-weight:700; color:#E6EDF3; display:flex; align-items:center; gap:10px; }
        .anav-logo span { color:#00C9A7; }
        .admin-tag { background:rgba(227,160,8,.15); color:#E3A008; border:1px solid rgba(227,160,8,.3); border-radius:6px; padding:2px 8px; font-size:12px; font-weight:600; }
        .anav-link { color:#8B949E; text-decoration:none; font-size:14px; }
        .anav-link:hover { color:#E6EDF3; }
        .acontainer-sm { max-width:680px; margin:0 auto; padding:32px 24px; }
        .apage-title { font-size:26px; font-weight:700; margin-bottom:4px; color:#E6EDF3; }
        .apage-sub { font-size:14px; color:#8B949E; margin-bottom:28px; }
        .aform-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:28px; }
        .aerror-box { background:rgba(248,81,73,.12); border:1px solid rgba(248,81,73,.3); border-radius:8px; padding:12px 14px; font-size:14px; color:#F85149; margin-bottom:20px; }
        .asection-label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#8B949E; margin-bottom:16px; }
        .asection-desc { font-size:13px; color:#8B949E; margin-top:-10px; margin-bottom:16px; }
        .afield { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
        .afield label { font-size:13px; font-weight:500; color:#C9D1D9; }
        .afield input { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:10px 12px; font-size:14px; color:#E6EDF3; outline:none; transition:border-color .15s; }
        .afield input:focus { border-color:#1D6FE8; }
        .ahint { font-size:12px; color:#8B949E; }
        .afields-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        .adivider { border:none; border-top:1px solid #30363D; margin:24px 0; }
        .aconstraints-preview { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:14px 16px; margin-bottom:24px; }
        .apreview-label { font-size:12px; color:#8B949E; margin-bottom:10px; }
        .apreview-tags { display:flex; gap:8px; flex-wrap:wrap; }
        .aconstraint-tag { background:rgba(0,201,167,.1); border:1px solid rgba(0,201,167,.25); color:#00C9A7; border-radius:6px; padding:4px 10px; font-size:12px; }
        .abtn-row { display:flex; gap:12px; align-items:center; }
      `}</style>
    </>
  );
}
