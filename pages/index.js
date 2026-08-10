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
    //Determine next page based on payload from login fetch data
    //Confirmed that this logic will move to the correct page if res.status in api/auth/login.js returns the payload as either student or tutor.
    if (res.ok && data.student.isAdmin == 0) {
      router.push('/dashboard');
    }
    else if (res.ok && data.student.isAdmin == 1) {
      router.push('/tutor_dash');
    }
    else {
      setError(data.error || 'Login failed.');
    }
  }

  return (
    <>
      <Head><title>TeamUp — Login</title></Head>
      <div className="wrap">
        <div className="card">
          <div className="logo logo--large">Team<span>Up</span></div>
          <p className="tagline">Student Team Formation · QUT IFB398</p>
          <form onSubmit={handleLogin}>
            {error && <div className="err">{error}</div>}
            <label>Student ID</label>
            <input  className="text-input" type="text" placeholder="e.g. n10000001" value={studentId} onChange={e => setStudentId(e.target.value)} required autoFocus />
            <label>Password</label>
            <input  className="text-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className="btn-login" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="hint">
            <strong>Demo accounts</strong> — password: <strong>password123</strong><br />
            n10000001 · n10000002 · n10000003 · n10000004 · n10000005<br />
            n10000006 · n10000007 · n10000008 · n10000009 · n10000010<br />
            Admins: bfarnsworth · wlu · mrezwani · hwang
          </div>
          <p className="sso">🔒 QUT SSO integration planned for Phase 2</p>
        </div>
        <style jsx>{`
          
          .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; background: var(--std-background); background-image:radial-gradient(ellipse at 20% 50%,rgba(29,111,232,.08) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,201,167,.06) 0%,transparent 50%); }
          .card { background:var(--card-background); border:1px solid var(--gray-dark-A); border-radius:16px; padding:48px 44px; width:100%; max-width:420px; }

          .tagline { font-size:14px; color: var(--gray-mid-A); margin-bottom:32px; }
          label { display:block; font-size:12px; font-weight:600; color: var(--gray-mid-A); margin-bottom:6px; text-transform:uppercase; letter-spacing:.05em; }
          input { width:100%; background: var(--std-background); border:1px solid var(--gray-dark-A); border-radius:8px; padding:12px 14px; font-size:15px; color: var(--gray-light-A); margin-bottom:18px; outline:none; transition:border-color .2s; box-sizing:border-box; }
          .btn-login { width:100%; background: var(--blue); color:white; border:none; border-radius:8px; padding:14px; font-size:15px; font-weight:600; cursor:pointer; transition:background .2s; margin-top:4px; }
          .btn-login:hover:not(:disabled) { background: var(--blue-variant); }
          .btn-login:disabled { opacity:.6; cursor:not-allowed; }
          .err { background: lch(from var(--red) l c h /.12); border:1px solid lch(from var(--red) l c h /.3); border-radius:8px; padding:12px 14px; font-size:14px; color: var(--red); margin-bottom:18px; }
          .hint { margin-top:24px; padding-top:20px; border-top:1px solid var(--gray-dark-A); font-size:13px; color:var(--gray-mid-A); line-height:1.7; }
          .hint strong { color: var(--gray-light-A); }
          .sso { margin-top:16px; font-size:12px; color: var(--gray-mid-A); text-align:center; opacity:.7; }
        `}</style>
      </div>
    </>
  );
}
