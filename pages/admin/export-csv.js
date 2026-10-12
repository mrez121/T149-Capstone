// pages/admin/export-csv.js
// Export CSV page — admin selects a unit and downloads group/student data

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';

/**
 * @function ExportCsvPage
 * Builds the ExportCsvPage using React.js
 * @returns Export CSV Page HTML
 */
export default function ExportCsvPage() {
  const router = useRouter();
  const [units,    setUnits]    = useState([]);
  const [unitCode, setUnitCode] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [fullExport, setFullExport] = useState('true');

  // Load all units on page load
  useEffect(() => {
    fetch('/api/admin/units')
      .then(r => r.json())
      .then(data => {
        setUnits(data.units || []);
        if (data.units?.length > 0) setUnitCode(data.units[0].unit_code);
      });
  }, []);

  // Trigger CSV download for selected unit
  /**
   * @function handleExport
   * @async
   * Trigger the CSV download for the selected unit
   * @param {*} e a react event
   */
  async function handleExport(e) {
    e.preventDefault();
    if (!unitCode) { setError('Please select a unit.'); return; }

    setLoading(true);
    setError('');

    // Fetch the CSV file from the API
    const res = await fetch(`/api/admin/export-csv?unitCode=${unitCode}&fullExport=${fullExport}`);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Export failed.');
      setLoading(false);
      return;
    }

    // Trigger browser download
    const blob     = await res.blob();
    const url      = window.URL.createObjectURL(blob);
    const a        = document.createElement('a');
    a.href         = url;
    a.download     = `${unitCode}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <>
      <Head><title>TeamUp — Export CSV</title></Head>

      {/* Navigation */}
      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/tutor_dash" className="anav-link anav-button">← Dashboard</Link>
      </nav>

      <div className="acontainer-sm">
        <h1 className="apage-title">Export CSV</h1>
        <p className="apage-sub">Download group formation data for a unit as a CSV file.</p>

        <form onSubmit={handleExport} className="aform-card">
          {error && <div className="aerror-box">{error}</div>}

          {/* Unit selection */}
          <div className="asection-label">Select Unit</div>
          <div className="afield">
            <label>Unit</label>
            <select value={unitCode} onChange={e => setUnitCode(e.target.value)} required>
              {units.map(u => (
                <option key={u.unit_code} value={u.unit_code}>
                  {u.unit_code} — {u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div className='asection-label'>Select Export Type</div>
          <div className='afield'>
            <label>Export Type</label>
            <select value={fullExport.toString()} onChange={e => setFullExport(e.target.value)} required>
              <option value='true'>
                Full Export - for use with other applications.
              </option>
              <option value='false'>
                Student IDs Only - use with Upload CSV to enrol students in other units.
              </option>
            </select>
          </div>

          <div className="adivider" />

          {/* What is exported */}
          <div className="asection-label">What is included</div>
          {fullExport === 'true' ? (
            <div className="export-info">
            <div className="export-row">
              <span className="export-col-header">Student ID</span>
              <span className="export-col-desc">Unique student identifier</span>
            </div>
            <div className="export-row">
              <span className="export-col-header">Student Info</span>
              <span className="export-col-desc">Name, email, cohort, new/returning status</span>
            </div>
            <div className="export-row">
              <span className="export-col-header">Group ID</span>
              <span className="export-col-desc">The group the student belongs to — NO_GROUP if not in one</span>
            </div>
            <div className="export-row">
              <span className="export-col-header">Group Status</span>
              <span className="export-col-desc">forming or locked</span>
            </div>
            <div className="export-row">
              <span className="export-col-header">Group Constraints</span>
              <span className="export-col-desc">Min size, max size, new students — true/false per constraint</span>
            </div>
          </div>
          ) : (
            <div className='export-info'>
              <div className='export-row'>
                <span className='export-col-header'>Student ID</span>
                <span className='export-col-desc'>Unique student identifier</span>
              </div>
            </div>
          )}

          <div className="abtn-row" style={{marginTop: 24}}>
            <button className="abtn abtn-blue" type="submit" disabled={loading || !unitCode}>
              {loading ? 'Exporting...' : 'Download CSV'}
            </button>
            <Link href="/tutor_dash" className="abtn abtn-ghost">Cancel</Link>
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
        .afield { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
        .afield label { font-size:13px; font-weight:500; color:#C9D1D9; }
        .afield select { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:10px 12px; font-size:14px; color:#E6EDF3; outline:none; }
        .afield select:focus { border-color:#1D6FE8; }
        .adivider { border:none; border-top:1px solid #30363D; margin:24px 0; }
        .export-info { display:flex; flex-direction:column; gap:10px; }
        .export-row { display:flex; gap:16px; padding:10px 14px; background:#0D1117; border-radius:8px; font-size:13px; }
        .export-col-header { font-weight:600; color:#00C9A7; min-width:160px; font-family:monospace; }
        .export-col-desc { color:#8B949E; }
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