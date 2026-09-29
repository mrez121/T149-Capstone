// pages/admin/units/[id]/unernol.js
// Unenrol a student in the specified unit

import {useState} from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import AdminToast from '../../../../components/AdminToast';

/**
 * @function UnenrolStudentPage
 * This function builds the unenrol student page using react.js
 * @returns Unenrol Student page HTML (if loading state = false) || Loading HTML (if loading state = true)
 */
export default function UnenrolStudentPage() {
    
    const router = useRouter();
    const {id} = router.query;
    const searchParams = useSearchParams();
    const unitCode = searchParams.get('unitCode');

    //Form state
    const [form, setForm] = useState({
        student_id: '',
        student_name: '',
        student_email: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    /**
     * @function handleChange
     * Update form state when input changes
     * @param {*} e react event
     */
    function handleChange(e) {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
    }

    /**
     * @function showToast
     * Show a temporary notification message
     * @param {*} msg
     * @param {*} type
     */
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4000);
    }

    /**
     * @function handleSubmit
     * @async
     * Submit student info to API for removal from unit/database
     * @param {*} e react event
     */
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch(`/api/admin/units/enrolments_students?unit=${id}&unitCode=${unitCode}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                student_id: form.student_id,
                name: form.student_name,
                email: form.student_email
            })
        });
        const data = await res.json();
        setLoading(false);

        if(res.ok) {
            showToast(`Student unenrolled from unit ${unitCode} successfully`);
        }
        else {
            setError(data.error || 'Failed to unenrol student');
        }
    }

    if(loading) return (
        <div style={{background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
            Loading...
        </div>
    );

    return(
        <>
            <Head><title>TeamUp - Unenrol student</title></Head>
            <AdminToast toast={toast} />

            <nav className='anav'>
                <div className='anav-logo'>Team<span>Up</span> <span className='admin-tag'>Admin</span></div>
                <Link href='/admin/units/enrolments' className='anav-link anav-button'>← Back to enrolments</Link>
            </nav>

            <div className='acontainer-sm'>
                <h1 className='apage-title'>Unenrol Student</h1>
                <p className='apage-sub'>Unenrol a student from {unitCode}</p>

                <form onSubmit={handleSubmit} className='aform-card'>
                    {error && <div className='aerror-box'>{error}</div>}
                    <div className='asection-label'>Student Details</div>

                    <div className='afield'>
                        <label>Student ID</label>
                        <input name='student_id' value={form.student_id} onChange={handleChange} required />
                    </div>

                    <div className='afield'>
                        <label>Student Name</label>
                        <input name='student_name' value={form.student_name} onChange={handleChange} required />
                    </div>

                    <div className='afield'>
                        <label>Student Email</label>
                        <input name='student_email' value={form.student_email} onChange={handleChange} required />
                    </div>

                    <div className='abtn-row'>
                        <button className='abtn abtn-red' type='submit' disabled={loading}>
                            {loading ? 'Unenrolling...' : 'Unenroll student'}
                        </button>
                        <Link href='/admin/units/enrolments' className='abtn abtn-ghost'>Cancel</Link>
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
