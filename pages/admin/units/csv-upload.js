// pages/admin/units/csv-upload.js
// CSV bulk enrolment page — admin selects a unit and uploads a CSV of student IDs

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';

/**
 * @function CsvUploadPage
 * Builds the CSV upload page using React.js
 * @returns CSV Upload Page HTML
 */
export default function CsvUploadPage() {
  const router = useRouter();

  // State for units list, selected unit and CSV file
  const [units,      setUnits]      = useState([]);
  const [unitCode,   setUnitCode]   = useState('');
  const [csvText,    setCsvText]    = useState('');
  const [fileName,   setFileName]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [results,    setResults]    = useState(null);
  const [error,      setError]      = useState('');

  // Load all units on page load so admin can select one
  useEffect(() => {
    fetch('/api/admin/units')
      .then(r => r.json())
      .then(data => {
        setUnits(data.units || []);
        if (data.units?.length > 0) setUnitCode(data.units[0].unit_code);
      });
  }, []);

  
  /**
   * @function handleFileChange
   * Reads the CSV file and stores its text content
   * @param {*} e - a react event
   */
  function handleFileChange(e) {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    
    if(!file.type.startsWith("text/")) {
      setError("Invalid file type. Please upload a .csv file.");
      return;
    }
    const extension = file.name.split('.').pop().toLowerCase();
    if(extension !== "csv") {
      setError("Invalid file type. Please upload a .csv file.");
      return;
    }
    setFileName(file.name);
    setResults(null);
    

    const reader = new FileReader();
    reader.onload = (evt) => setCsvText(evt.target.result);
    reader.readAsText(file);
  }

  /**
   * @function handleSubmit
   * @async
   * Submit the CSV file to the API for bulk enrolment into a unit
   * @param {*} e - a react event 
   */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!csvText) { setError('Please select a CSV file.'); return; }
    if (!unitCode) { setError('Please select a unit.'); return; }

    setLoading(true);
    setError('');
    setResults(null);

    const csvHeader = csvText.split(/\r?\n/)[0];
    if(csvHeader !== "student_id") {
      setError('Incorrect CSV format. Column header must be "student_id"');
      setLoading(false);
      return;
    }

    const res  = await fetch('/api/admin/units/csv-enrol', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ unitCode, csvText }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResults(data);
    } else {
      setError(data.error || 'Upload failed.');
    }
  }

  return (
    <>
      <Head><title>TeamUp — CSV Enrolment Upload</title></Head>

      {/* Navigation */}
      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/admin/units/enrolments" className="anav-link anav-button">← Back to enrolments</Link>
      </nav>

      <div className="acontainer-sm">
        <h1 className="apage-title">CSV Bulk Enrolment</h1>
        <p className="apage-sub">Upload a CSV file to enrol multiple students into a unit at once.</p>

        <form onSubmit={handleSubmit} className="aform-card">

          {error && <div className="aerror-box">{error}</div>}

          {/* Unit selection */}
          <div className="asection-label">Select Unit</div>
          <div className="afield">
            <label>Unit</label>
            <select
              value={unitCode}
              onChange={e => setUnitCode(e.target.value)}
              required
            >
              {units.map(u => (
                <option key={u.unit_code} value={u.unit_code}>
                  {u.unit_code} — {u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div className="adivider" />

          {/* CSV upload */}
          <div className="asection-label">Upload CSV File</div>
          <p className="asection-desc">
            The CSV file should have one student ID per line. The first line can be a header called <strong>student_id</strong>.
          </p>

          {/* CSV format example */}
          <div className="csv-example">
            <div className="csv-example-label">Expected format</div>
            <pre className="csv-preview">
{`student_id
n10000001
n10000002
n10000003`}
            </pre>
          </div>

          <div className="afield">
            <label>CSV File</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                id="csv-file"
                style={{ display: 'none' }}
              />
              <label htmlFor="csv-file" className="abtn abtn-ghost" style={{ cursor: 'pointer' }}>
                📂 Choose CSV file
              </label>
              {fileName && <span className="file-name">✓ {fileName}</span>}
            </div>
          </div>

          <div className="abtn-row">
            <button className="abtn abtn-blue" type="submit" disabled={loading || !csvText}>
              {loading ? 'Uploading...' : 'Upload and enrol'}
            </button>
            <Link href="/admin/units/enrolments" className="abtn abtn-ghost">Cancel</Link>
          </div>
        </form>

        {/* Results panel */}
        {results && (
          <div className="results-card">
            <div className="results-title">Upload Complete — {results.unitCode}</div>

            {/* Summary counts */}
            <div className="results-summary">
              <div className="result-stat stat-green">
                <div className="stat-num">{results.summary.enrolled}</div>
                <div className="stat-label">Enrolled</div>
              </div>
              <div className="result-stat stat-amber">
                <div className="stat-num">{results.summary.skipped}</div>
                <div className="stat-label">Already enrolled</div>
              </div>
              <div className="result-stat stat-red">
                <div className="stat-num">{results.summary.notFound}</div>
                <div className="stat-label">Not found</div>
              </div>
              <div className="result-stat stat-gray">
                <div className="stat-num">{results.summary.total}</div>
                <div className="stat-label">Total in CSV</div>
              </div>
            </div>

            {/* Not found list */}
            {results.results.notFound.length > 0 && (
              <div className="result-section">
                <div className="result-section-title">❌ Student IDs not found in the system</div>
                <div className="result-list">
                  {results.results.notFound.map(id => (
                    <span key={id} className="result-tag tag-red">{id}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped list */}
            {results.results.skipped.length > 0 && (
              <div className="result-section">
                <div className="result-section-title">⚠️ Already enrolled — skipped</div>
                <div className="result-list">
                  {results.results.skipped.map(id => (
                    <span key={id} className="result-tag tag-amber">{id}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Enrolled list */}
            {results.results.enrolled.length > 0 && (
              <div className="result-section">
                <div className="result-section-title">✅ Successfully enrolled</div>
                <div className="result-list">
                  {results.results.enrolled.map(id => (
                    <span key={id} className="result-tag tag-green">{id}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
        .aform-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:28px; margin-bottom:24px; }
        .aerror-box { background:rgba(248,81,73,.12); border:1px solid rgba(248,81,73,.3); border-radius:8px; padding:12px 14px; font-size:14px; color:#F85149; margin-bottom:20px; }
        .asection-label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#8B949E; margin-bottom:16px; }
        .asection-desc { font-size:13px; color:#8B949E; margin-top:-10px; margin-bottom:16px; line-height:1.6; }
        .asection-desc strong { color:#E6EDF3; }
        .afield { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
        .afield label { font-size:13px; font-weight:500; color:#C9D1D9; }
        .afield select { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:10px 12px; font-size:14px; color:#E6EDF3; outline:none; }
        .afield select:focus { border-color:#1D6FE8; }
        .adivider { border:none; border-top:1px solid #30363D; margin:24px 0; }
        .csv-example { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:14px 16px; margin-bottom:18px; }
        .csv-example-label { font-size:12px; color:#8B949E; margin-bottom:8px; }
        .csv-preview { font-family:monospace; font-size:13px; color:#00C9A7; line-height:1.6; }
        .file-upload-area { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        .file-name { font-size:13px; color:#3FB950; font-family:monospace; }
        .abtn-row { display:flex; gap:12px; align-items:center; margin-top:8px; }
        .abtn { padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all .15s; text-decoration:none; display:inline-block; }
        .abtn-blue { background:#1D6FE8; color:white; }
        .abtn-blue:hover:not(:disabled) { background:#1353B0; }
        .abtn-blue:disabled { opacity:.6; cursor:not-allowed; }
        .abtn-ghost { background:none; color:#8B949E; border:1px solid #30363D; }
        .abtn-ghost:hover { color:#E6EDF3; border-color:#8B949E; }
        .results-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:24px; }
        .results-title { font-size:16px; font-weight:600; color:#E6EDF3; margin-bottom:20px; }
        .results-summary { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; margin-bottom:24px; }
        .result-stat { border-radius:8px; padding:14px; text-align:center; }
        .stat-green { background:rgba(63,185,80,.1);  border:1px solid rgba(63,185,80,.25); }
        .stat-amber { background:rgba(227,160,8,.1);  border:1px solid rgba(227,160,8,.25); }
        .stat-red   { background:rgba(248,81,73,.1);  border:1px solid rgba(248,81,73,.25); }
        .stat-gray  { background:#1C2128; border:1px solid #30363D; }
        .stat-num { font-size:28px; font-weight:700; color:#E6EDF3; }
        .stat-label { font-size:12px; color:#8B949E; margin-top:4px; }
        .result-section { margin-bottom:16px; }
        .result-section-title { font-size:13px; font-weight:500; color:#8B949E; margin-bottom:8px; }
        .result-list { display:flex; flex-wrap:wrap; gap:6px; }
        .result-tag { padding:3px 10px; border-radius:6px; font-size:12px; font-family:monospace; }
        .tag-green { background:rgba(63,185,80,.1);  color:#3FB950; border:1px solid rgba(63,185,80,.25); }
        .tag-amber { background:rgba(227,160,8,.1);  color:#E3A008; border:1px solid rgba(227,160,8,.25); }
        .tag-red   { background:rgba(248,81,73,.1);  color:#F85149; border:1px solid rgba(248,81,73,.25); }
      `}</style>
    </>
  );
}