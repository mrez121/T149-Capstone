// pages/tutor_dash.js
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function adminDashboard() {
  const router = useRouter();
  const [toast, setToast] = useState(null);

  // Reusable feedback helper for actions on page
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  // Logout and return to login page
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <>
      <Head><title>TeamUp - Tutor Dashboard</title></Head>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </nav>

      <div className="acontainer">
        <h1 className="apage-title">Tutor Dashboard</h1>
        <p className="apage-sub">Manage units, enrolments and group formation</p>

        {/* Admin navigation cards */}
        <div className="admin-grid">

          <div className="admin-card">
            <div className="admin-card-icon">🏫</div>
            <div className="admin-card-title">Units</div>
            <div className="admin-card-desc">Create, edit and delete units. Set group formation constraints per unit.</div>
            <Link href="/admin/units" className="abtn abtn-blue">Manage Units</Link>
          </div>

          <div className="admin-card">
            <div className="admin-card-icon">👥</div>
            <div className="admin-card-title">Enrolments</div>
            <div className="admin-card-desc">View and manage student enrolments for each unit.</div>
            <Link href="/admin/units/enrolments" className="abtn abtn-teal">View Enrolments</Link>
          </div>

        </div>
      </div>

      <style jsx>{`
        .toast { position:fixed; top:20px; right:20px; z-index:999; padding:12px 20px; border-radius:8px; font-size:14px; font-weight:500; }
        .toast-success { background:rgba(63,185,80,.15); border:1px solid rgba(63,185,80,.4); color:#3FB950; }
        .toast-error   { background:rgba(248,81,73,.15); border:1px solid rgba(248,81,73,.4); color:#F85149; }
        .anav { display:flex; align-items:center; justify-content:space-between; padding:16px 32px; border-bottom:1px solid #30363D; background:#161B22; }
        .anav-logo { font-size:20px; font-weight:700; color:#E6EDF3; display:flex; align-items:center; gap:10px; }
        .anav-logo span { color:#00C9A7; }
        .admin-tag { background:rgba(227,160,8,.15); color:#E3A008; border:1px solid rgba(227,160,8,.3); border-radius:6px; padding:2px 8px; font-size:12px; font-weight:600; }
        .logout-btn { background:none; border:1px solid #30363D; color:#8B949E; padding:7px 14px; border-radius:6px; cursor:pointer; font-size:13px; }
        .logout-btn:hover { color:#E6EDF3; border-color:#8B949E; }
        .acontainer { max-width:1100px; margin:0 auto; padding:32px 24px; }
        .apage-title { font-size:26px; font-weight:700; margin-bottom:4px; color:#E6EDF3; }
        .apage-sub { font-size:14px; color:#8B949E; margin-bottom:32px; }
        .admin-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:20px; }
        .admin-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:24px; display:flex; flex-direction:column; gap:12px; }
        .admin-card-icon { font-size:32px; }
        .admin-card-title { font-size:18px; font-weight:600; color:#E6EDF3; }
        .admin-card-desc { font-size:13px; color:#8B949E; line-height:1.5; flex:1; }
        .abtn { padding:9px 18px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .15s; text-decoration:none; display:inline-block; }
        .abtn-blue { background:#1D6FE8; color:white; }
        .abtn-blue:hover { background:#1353B0; }
        .abtn-teal { background:rgba(0,201,167,.15); color:#00C9A7; border:1px solid rgba(0,201,167,.3); }
        .abtn-teal:hover { background:rgba(0,201,167,.25); }
      `}</style>
    </>
  );
}