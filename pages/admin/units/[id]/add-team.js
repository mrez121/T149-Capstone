// pages/admin/units/[id]/add-team.js
// Add a team to the specified unit

import { useState } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import AdminToast from "../../../../components/AdminToast";

export default function AddTeamPage() {

    const router = useRouter();
    const {id} = router.query;
    const searchParams = useSearchParams();
    const unitCode = searchParams.get('unitCode');

    //Form state
    const [form, setForm] = useState({
        team_id: '',
        name: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);

    function handleChange(e) {
        const {name, value} = e.target;
        setForm(f => ({...f, [name]: value}));
    }

    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch(`/api/admin/units/teams?unit=${id}&unitCode=${unitCode}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                submit_type: 'createTeam',
                team_id: '',
                name: ''
            })
        });
        const data = await res.json();
        setLoading(false);

        if(res.ok) {
            showToast(`Team added to unit ${unitCode} successfully.`);
        }
        else {
            setError(data.error || `Failed to add team`);
        }
    }

    //HTML construction here
    if(loading) return(
        <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
            Loading...
        </div>
    );

    return(
        <>
            <Head><title>TeamUp - Create Team</title></Head>
            <AdminToast toast={toast}/>

            <nav className="anav">
                <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
                <Link href="/admin/units/manage_teams" className="anav-link anav-button">← Back to team management</Link>
            </nav>

            <div className="acontainer-sm">
                <h1 className="apage-title">Add Team</h1>
                <p className="apage-sub">Add a team to {unitCode}</p>

                <form onSubmit={handleSubmit} className="aform-card">
                    {error && <div className='aerror-box'>{error}</div>}
                    <div className="asection-label">Team Details</div>

                    <div className="afield">
                        <label>Team ID</label>
                        <input name="team_id" value={form.team_id} onChange={handleChange} required />
                    </div>

                    <div className="afield">
                        <label>Team Name</label>
                        <input name="name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="abtn-row">
                        <button className="abtn abtn-blue" type="submit" disabled={loading}>
                            {loading ? 'Creating team...' : 'Add team'}
                        </button>
                        <Link href='/admin/units/manage_teams' className="abtn abtn-ghost">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    )
}