// pages/admin/units/[id].js
// Edit an existing unit's details and constraints

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';

/**
 * @function EditUnitPage
 * Builds TeamUp's edit unit page using react.js
 * @returns Edit unit page HTML (if loading state = false) || loading HTML (if loading state= true)
 */
export default function EditUnitPage() {
  /**
   * @const router
   * @const id
   * @const form
   * @const loading
   * @const saving
   * @const error
   * @const toast
   */
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [form, setForm] = useState({
    unit_code: '',
    unit_name: '',
    semester:  '',
    min_size:  4,
    max_size:  5,
    max_new:   2,
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null);

  // Load existing unit data when page loads
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/units/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.unit) {
          setForm({
            unit_code: data.unit.unit_code,
            unit_name: data.unit.unit_name,
            semester:  data.unit.semester,
            min_size:  data.unit.min_size ?? 4,
            max_size:  data.unit.max_size ?? 5,
            max_new:   data.unit.max_new  ?? 2,
          });
        }
        setLoading(false);
      });
  }, [id]);

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
   * @function showToast
   * Show a temporary notification message
   * @param {*} msg 
   * @param {*} type 
   */
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  /**
   * @function handleSubmit
   * @async
   * Submit updated unit to the API
   * @param {*} e react event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch(`/api/admin/units/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        unit_name: form.unit_name,
        semester:  form.semester,
        min_size:  Number(form.min_size),
        max_size:  Number(form.max_size),
        max_new:   Number(form.max_new),
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) { showToast('Unit updated successfully.'); }
    else        { setError(data.error || 'Failed to update unit.'); }
  }

  if (loading) return (
    <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
      Loading...
    </div>
  );

  return (
    <>
      <Head><title>TeamUp — Edit Unit</title></Head>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/admin/units" className="anav-link">← Back to units</Link>
      </nav>

      <div className="acontainer-sm">
        <h1 className="apage-title">Edit Unit</h1>
        <p className="apage-sub">Update unit details and group formation constraints</p>

        <form onSubmit={handleSubmit} className="aform-card">
          {error && <div className="aerror-box">{error}</div>}

          <div className="asection-label">Unit Details</div>

          {/* Unit code is read only */}
          <div className="afield">
            <label>Unit Code</label>
            <input name="unit_code" value={form.unit_code} disabled style={{opacity:.5, cursor:'not-allowed'}} />
            <span className="ahint">Unit code cannot be changed after creation</span>
          </div>

          <div className="afield">
            <label>Unit Name</label>
            <input name="unit_name" value={form.unit_name} onChange={handleChange} required />
          </div>

          <div className="afield">
            <label>Semester</label>
            <input name="semester" value={form.semester} onChange={handleChange} required />
          </div>

          <div className="adivider" />

          <div className="asection-label">Group Formation Constraints</div>
          <p className="asection-desc">Changes apply to new groups only — existing groups are not affected.</p>

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
            </div>
          </div>

          <div className="aconstraints-preview">
            <div className="apreview-label">Current constraints</div>
            <div className="apreview-tags">
              <span className="aconstraint-tag">👥 {form.min_size}–{form.max_size} members per group</span>
              <span className="aconstraint-tag">🎓 Max {form.max_new} new students per group</span>
              <span className="aconstraint-tag">🗓 1+ shared tutorial slot required</span>
            </div>
          </div>

          <div className="abtn-row">
            <button className="abtn abtn-blue" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <Link href="/admin/units" className="abtn abtn-ghost">Cancel</Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .toast { position:fixed; top:20px; right:20px; z-index:999; padding:12px 20px; border-radius:8px; font-size:14px; font-weight:500; }
        .toast-success { background:rgba(63,185,80,.15); border:1px solid rgba(63,185,80,.4); color:#3FB950; }
        .toast-error   { background:rgba(248,81,73,.15); border:1px solid rgba(248,81,73,.4); color:#F85149; }
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
        .abtn { padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all .15s; text-decoration:none; display:inline-block; }
        .abtn-blue { background:#1D6FE8; color:white; }
        .abtn-blue:hover:not(:disabled) { background:#1353B0; }
        .abtn-blue:disabled { opacity:.6; cursor:not-allowed; }
        .abtn-ghost { background:none; color:#8B949E; border:1px solid #30363D; }
        .abtn-ghost:hover { color:#E6EDF3; border-color:#8B949E; }
      `}</style>
    </>
  );
}