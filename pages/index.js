// pages/index.js — Login page
import { useState }  from 'react';
import { useRouter } from 'next/router';
import Head          from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res  = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ studentId, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { router.push('/dashboard'); }
    else        { setError(data.error || 'Login failed.'); }
  }

  return (
    <>
      <Head><title>TeamUp — Login</title></Head>
      <div className="wrap">
        <div className="card">
          <div className="logo">Team<span>Up</span></div>
          <p className="tagline">Student Team Formation · QUT IFB398</p>
          <form onSubmit={handleLogin}>
            {error && <div className="err">{error}</div>}
            <label>Student ID</label>
            <input type="text" placeholder="e.g. n10000001" value={studentId} onChange={e => setStudentId(e.target.value)} required autoFocus />
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="hint">
            <strong>Demo accounts</strong> — password: <strong>password123</strong><br />
            n10000001 · n10000002 · n10000003 · n10000004 · n10000005<br />
            n10000006 · n10000007 · n10000008 · n10000009 · n10000010
          </div>
          <p className="sso">🔒 QUT SSO integration planned for Phase 2</p>
        </div>
        <style jsx>{`
          * { box-sizing:border-box; margin:0; padding:0; }
          :global(body) { font-family:-apple-system,sans-serif; }
          .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0D1117; background-image:radial-gradient(ellipse at 20% 50%,rgba(29,111,232,.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,201,167,.06) 0%,transparent 50%); }
          .card { background:#161B22; border:1px solid #30363D; border-radius:16px; padding:48px 44px; width:100%; max-width:420px; }
          .logo { font-size:32px; font-weight:700; color:#E6EDF3; margin-bottom:6px; letter-spacing:-1px; }
          .logo span { color:#00C9A7; }
          .tagline { font-size:14px; color:#8B949E; margin-bottom:32px; }
          label { display:block; font-size:12px; font-weight:600; color:#8B949E; margin-bottom:6px; text-transform:uppercase; letter-spacing:.05em; }
          input { width:100%; background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:12px 14px; font-size:15px; color:#E6EDF3; margin-bottom:18px; outline:none; transition:border-color .2s; box-sizing:border-box; }
          input:focus { border-color:#1D6FE8; }
          .btn-login { width:100%; background:#1D6FE8; color:white; border:none; border-radius:8px; padding:14px; font-size:15px; font-weight:600; cursor:pointer; transition:background .2s; margin-top:4px; }
          .btn-login:hover:not(:disabled) { background:#1353B0; }
          .btn-login:disabled { opacity:.6; cursor:not-allowed; }
          .err { background:rgba(248,81,73,.12); border:1px solid rgba(248,81,73,.3); border-radius:8px; padding:12px 14px; font-size:14px; color:#F85149; margin-bottom:18px; }
          .hint { margin-top:24px; padding-top:20px; border-top:1px solid #30363D; font-size:13px; color:#8B949E; line-height:1.7; }
          .hint strong { color:#E6EDF3; }
          .sso { margin-top:16px; font-size:12px; color:#8B949E; text-align:center; opacity:.7; }
        `}</style>
      </div>
    </>
  );
}
