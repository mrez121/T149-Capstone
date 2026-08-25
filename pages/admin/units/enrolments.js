//pages/admin/units/enrolments
//Show all enrolments for a specified unit. Add students to units individually.
// Import students and export enrolments via CSV file.
import {useState, useEffect} from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

/**
 * @function enrolmentsPage
 * Builds the TeamUp enrolments page using react.js
 * @returns enrolments page HTML (if loading state = false) || loading HTML (if loading state = true)
 */
export default function enrolmentsPage() {
    //Router and states
    const router = useRouter();
    const [allUnits, setAllUnits] = useState([]);
    const [enrolments, setEnrolments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    //Fetch units from enrolments-units API on page load
    /**
     * @function loadUnits
     * @async
     * Fetch units from enrolments-units API on page load 
     */
    async function loadUnits() {
        const res = await fetch('/api/admin/units/enrolments_units');
        //Return to login page if not authorised to view admin pages
        if(res.status === 401) {router.push('/'); return;}
        if(res.status === 403) {router.push('/'); return;}
        const data = await res.json();
        //Store units in state
        setAllUnits(data.units || []);
        setLoading(false);
    }
    //Load content
    useEffect(() => {loadUnits();}, []);
      
    /**
     * @function showToast
     * Show temporary notification message to confirm actions have been completed
     * @param {*} msg 
     * @param {*} type 
     */
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4500)
    }

    /**
     * @function getEnrolments
     * @async
     * Get the enrolments for a specified unit from database, show a toast, and display enrolment data.
     * If there is an error, display the error.
     * @param {*} unitCode 
     */
    async function getEnrolments(unitCode) {
        //Pass unit code to URL parameters
        const res = await fetch(`/api/admin/units/enrolments_students?unit=${unitCode}`, {method: 'GET'});
        const data = await res.json();

        //Check if the query was successful, throw an error if not.
        if(res.ok) {
            //Notification to show that data was successfully grabbed
            showToast(`${unitCode} enrolments fetched.`);
            //Store enrolments in state
            setEnrolments(data.enrolments);
        }
        else {
            showToast(data.error, 'error');
        }
    }

    /**
     * @function handleLogout
     * @async
     * Log out of the enrolents page and return to login page
     */
    async function handleLogout() {
        await fetch("/api/auth/logout", {method: "POST"});
        router.push("/");
    }

    //Loading graphic
    if (loading) return (
    <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
      Loading...
    </div>
  );

  //HTML construction
  return (
    <>
      <Head><title>TeamUp — Enrolments</title></Head>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/tutor_dash" className="anav-link">← Dashboard</Link>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </nav>

    {/*Card constructions for units - same design as units page */}
      {allUnits.length == 0 ? (
        <div className="aempty">
            <div className="aempty-icon">🏫</div>
            <div className="aempty-text">No units available</div>
        </div>
      ) : (
        <div className="aunits-grid">
            {allUnits.map(u => (
                <div key = {u.id} className="aunit-card">
                    <div className="aunit-code">{u.unit_code}</div>
                    <div className="aunit-name">{u.unit_name}</div>
                    <div className="aunit-semester">{u.semester}</div>
                    <div className="aunit-actions">
                        <button className="abtn abtn-blue" onClick={() => getEnrolments(u.unit_code)}>{u.unit_code} Enrolments</button>
                        <Link href={`/admin/units/${u.unit_code}/enrol`} className="abtn abtn-teal abtn-sm">Enrol student</Link>
                        <Link href={`/admin/units/${u.unit_code}/unenrol`} className="abtn abtn-teal abtn-sm">Unenrol student</Link>
                    </div>
                </div>
            ))}
        </div>
      )}

    {/*List construct of students in a unit */}

      {enrolments.length === 0 ? (
        <div>
            <div className="aempty-text">No enrolments selected</div>
        </div>
      ) : (
        <div>
            {enrolments.map(e => (
                <div key = {e.student_id}className="aconstraints-row">
                    <ul className="aempty-text">
                        <li>ID: {e.student_id}<p>Name: {e.name}, Email: {e.email}</p></li>
                    </ul>
                </div>

            ))}
        </div>
      )}

        

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
        .acontainer { max-width:1100px; margin:0 auto; padding:32px 24px; }
        .apage-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; flex-wrap:wrap; gap:16px; }
        .apage-title { font-size:26px; font-weight:700; margin-bottom:4px; color:#E6EDF3; }
        .apage-sub { font-size:14px; color:#8B949E; }
        .aempty { text-align:center; padding:64px 24px; color:#8B949E; }
        .aempty-icon { font-size:48px; margin-bottom:12px; }
        .aempty-text { font-size:16px; margin-bottom:8px; }
        .aunits-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
        .aunit-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:22px; display:flex; flex-direction:column; gap:8px; }
        .aunit-code { font-size:22px; font-weight:700; color:#1D6FE8; font-family:monospace; }
        .aunit-name { font-size:15px; font-weight:500; color:#E6EDF3; }
        .aunit-semester { font-size:13px; color:#8B949E; }
        .aconstraints-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:4px; }
        .aconstraint-tag { background:rgba(0,201,167,.1); border:1px solid rgba(0,201,167,.25); color:#00C9A7; border-radius:6px; padding:3px 10px; font-size:12px; }
        .aunit-stats { display:flex; gap:16px; font-size:13px; color:#8B949E; margin-top:4px; }
        .aunit-actions { display:flex; gap:8px; margin-top:8px; }
        .abtn { padding:9px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .15s; text-decoration:none; display:inline-block; }
        .abtn-sm { padding:6px 14px; font-size:12px; }
        .abtn-blue { background:#1D6FE8; color:white; }
        .abtn-blue:hover { background:#1353B0; }
        .abtn-teal { background:rgba(0,201,167,.15); color:#00C9A7; border:1px solid rgba(0,201,167,.3); }
        .abtn-teal:hover { background:rgba(0,201,167,.25); }
        .abtn-red { background:rgba(248,81,73,.12); color:#F85149; border:1px solid rgba(248,81,73,.3); }
        .abtn-red:hover { background:rgba(248,81,73,.22); }
      `}</style>
    </>
  );
}