// pages/admin/units/[id]/teams/[teamId]/groups.js
// Add/remove groups to/from a team.

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import AdminToast from "../../../../../../components/AdminToast";

/**
 * @function TeamGroupsPage
 * Builds the Team Groups Page in React.js
 * @returns Team Groups Page HTML (if loading = false) || Loading HTML (if loading = true)
 */
export default function TeamGroupsPage() {
    const router = useRouter();
    const {id, teamId} = router.query;
    const searchParams = useSearchParams();
    const teamName = searchParams.get('name');
    const unitCode = searchParams.get('unitCode');

    const [teamGroups, setTeamGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const [teamSize, setTeamSize] = useState(0);
    const [teamNewCount, setTeamNewCount] = useState(0);

    const [minSize, setMinSize] = useState(null);
    const [maxSize, setMaxSize] = useState(null);
    const [maxNew, setMaxNew] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    const toastTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(toastTimerRef.current), []);

    /**
     * @function loadGroupAndUnitData
     * @async
     * Fetches group information and unit constraints from the database for use in validating team construction
     */
    async function loadGroupAndUnitData() {
        try {
            const res = await fetch(`/api/admin/units/teams_groups?unit=${id}&teamId=${teamId}`, {method: 'GET'});
            if(res.status === 401) {
                router.push('/');
                return;
            }
            if(!res.ok) {
                throw new Error(data.error || 'Unable to load groups.');
            }
            const data = await res.json();
            const groups = data.groups;
            setGroups(groups);

            const teamGroupIds = data.teamGroups.map(group => group.group_id);
            setTeamGroups(teamGroupIds);
            let teamMemberCount = 0;
            let teamMemberNewCount = 0;
            for(const group of data.teamGroups) {
                teamMemberCount += group.group_member_count;
                teamMemberNewCount += group.new_count;
            }
            setTeamSize(teamMemberCount);
            setTeamNewCount(teamMemberNewCount);

            const constraints = data.constraints[0];
            setMinSize(constraints.min_size);
            setMaxSize(constraints.max_size);
            setMaxNew(constraints.max_new);
            
            console.log(data);

        } catch {
            showToast('Unable to load groups. Please reload the page.', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {loadGroupAndUnitData();}, [id, teamId, teamName, unitCode]);

    /**
     * @function showToast
     * Shows a temporary notification message
     * @param {*} msg - the message to be displayed
     * @param {*} type - the type of message to be displayed
     */
    function showToast(msg, type = 'success') {
        clearTimeout(toastTimerRef.current);
        setToast({msg, type});
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    }

    /**
     * @function handleLogout
     * Log the user out of TeamUp
     */
    async function handleLogout() {
        await fetch('/api/auth/logout', {method: 'POST'});
        router.push('/');
    }

    /**
     * @function handleGroupSelect
     * Checks if the group has been added to the team, updates group selection, team size, and new member counts accordingly if the
     * group has been added or removed from the team.
     * @param {*} groupId - the id of the group selected.
     * @param {*} memberCount - how many students are in the selected group
     * @param {*} newCount - how many new students are in the selected group
     */
    function handleGroupSelect(groupId, memberCount, newCount) {
        const selectCheck = teamGroups.includes(groupId);

        if(!selectCheck) {
            setTeamGroups([...teamGroups, groupId]);
            setTeamSize(teamSize + memberCount);
            setTeamNewCount(teamNewCount + newCount);
        }
        if(selectCheck){
            setTeamGroups(teamGroups.filter(group => group !== groupId));
            setTeamSize(teamSize - memberCount);
            setTeamNewCount(teamNewCount - newCount);
        }
    }

    /**
     * @function saveTeamGroups
     * @async
     * Save the list of selected groups to the team.
     * @param {*} e - react event
     */
    async function saveTeamGroups(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        // Check if team size is greater than the max team size for the unit
        if(teamSize > maxSize) {
            setError('Error: Team size is greater than maximum team size allowed for unit.');
            setSaving(false);
            return;
        }
        // Check if the team's new student count is greater than the allowed size for the unit.
        if(teamNewCount > maxNew) {
            setError('Error: Team has more new students than allowed for unit.');
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`/api/admin/units/teams_groups?unit=${id}&teamId=${teamId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    teamGroups: teamGroups,
                    teamSize: teamSize,
                }),
            });
            const data = await res.json();
            if(res.ok) {
                showToast('Team saved successfully.');
            } else {
                setError(data.error || 'Failed to update team. Please try again.');
            }
        } catch {
            setError('Unable to save team changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    // Loading graphic
    if (loading) return (
        <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
            Loading...
        </div>
    );

    //HTML Construction
    return(
        <>
            <Head><title>TeamUp - Manage team {teamName}</title></Head>
            <AdminToast toast={toast} />

            <nav className="anav">
                <div className="anav-logo">Team<span>Up</span><span className='admin-tag'>Admin</span></div>
                <Link href='/admin/units/manage_teams' className="anav-link anav-button">← Back to team management</Link>
                <button className="logout-btn" onClick={handleLogout}>Sign out</button>
            </nav>

            <main className="acontainer">
                <div className="apage-header">
                    <div>
                        <h1 className="apage-title">Manage Team {teamName}</h1>
                        <p className="apage-sub">Add or remove groups from a team</p>
                    </div>
                </div>

                <div className="acontainer">
                    <form onSubmit={saveTeamGroups} className="card">
                        <div className={`formation-check ${
                            teamSize >= minSize && teamSize <= maxSize ? 'complete' : 'attention'}`}
                        >
                            <span>Team size:</span> <strong>{teamSize} / {minSize}-{maxSize}</strong>                   
                        </div>
                        <br/>
                        <div className={`formation-check ${
                            teamNewCount <= maxNew ? 'complete' : 'attention'
                        }`}>
                            <span>Team new count:</span> <strong>{teamNewCount} / {maxNew}</strong>
                        </div>
                        <br/>
                        {error && <div className="aerror-box">{error}</div>}
                        <h2>Groups</h2>
                        <br/>
                        <ul className="team-group-list">
                            {groups.map((item) => {
                                const selectedGroup = teamGroups.includes(item.group_id);
                                if(selectedGroup) {
                                    return(
                                        <button
                                            key={item.group_id}
                                            type="button"
                                            className="btn btn-teal"
                                            value={item.group_id}
                                            onClick={() => handleGroupSelect(item.group_id, item.group_member_count, item.new_count)}
                                        >
                                            {item.name} - {item.group_id}<br/>
                                            {item.group_member_count} students
                                        </button>
                                    )
                                }
                                if(!selectedGroup) {
                                    return(
                                        <button
                                            key={item.group_id}
                                            type="button"
                                            className="btn btn-red"
                                            value={item.group_id}
                                            onClick={() => handleGroupSelect(item.group_id, item.group_member_count, item.new_count)}
                                        >
                                        {item.name} - {item.group_id}<br/>
                                        {item.group_member_count} students
                                        </button>
                                    )
                                }
                            })}
                        </ul>
                        <br/>
                        <div className="abtn-row">
                            <button className="abtn abtn-blue" type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save team'}
                            </button>
                        </div>
                    </form>
                </div>

            </main>

            <style jsx global>{`
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
                .apage-section + .apage-section { margin-top:36px; }
                .asection-header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom:16px; }
                .asection-title { margin:0 0 4px; font-size:18px; font-weight:650; color:#E6EDF3; }
                .asection-sub { margin:0; font-size:13px; color:#8B949E; }
                .aerror-box { background: rgba(248,81,73,.12); border: 1px solid rgba(248,81,73,.3); border-radius:8px; padding:12px 14px; font-size:14px; color:#F85149; margin-bottom:20px;}
                .aempty { text-align:center; padding:64px 24px; color:#8B949E; }
                .aempty-panel { background:#161B22; border:1px solid #30363D; border-radius:12px; }
                .aempty-compact { padding:36px 24px; }
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
                .aunit-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:8px; }
                .agroups-scroll { width:100%; overflow-x:auto; border:1px solid #30363D; border-radius:12px; background:#161B22; }
                .agroup-filters { display:flex; align-items:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
                .agroup-filters label { display:flex; flex-direction:column; gap:6px; color:#8B949E; font-size:12px; }
                .agroup-filters select { min-height:38px; padding:8px 12px; background:#161B22; color:#E6EDF3; border:1px solid #30363D; border-radius:8px; font-size:14px; }
                .agroup-filters select:focus-visible { outline:2px solid #1D6FE8; }
                .agroup-filters select:disabled { opacity:.6; }
                .agroup-pagination, .agroup-page-buttons { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
                .agroup-pagination { margin-top:16px; color:#8B949E; font-size:13px; }
                .agroups-table { width:100%; min-width:680px; border-collapse:collapse; text-align:left; font-size:14px; }
                .agroups-table th, .agroups-table td { padding:12px 16px; border-bottom:1px solid #30363D; vertical-align:middle; }
                .agroups-table thead th { background:#1C2128; color:#8B949E; font-size:12px; font-weight:600; }
                .agroups-table tbody th { width:32%; font-weight:400; }
                .agroups-table .abtn { white-space:nowrap; }
                .agroups-scroll:focus-visible, .agroups-table button:focus-visible { outline:2px solid #1D6FE8; outline-offset:-2px; }
                .adata-name { color:#E6EDF3; font-size:14px; font-weight:650; overflow-wrap:anywhere; }
                .adata-id { color:#8B949E; font-family:monospace; font-size:12px; margin-top:2px; }
                .agroups-table .agroup-details { padding:16px; background:#0D1117; color:#8B949E; font-size:13px; }
                .agroup-creator { margin-bottom:12px; }
                .agroup-details strong { color:#E6EDF3; font-weight:500; }
                .amember-list { list-style:none; }
                .amember-list li { display:grid; grid-template-columns:1.5fr 1.4fr 1.4fr 1fr; gap:16px; padding:8px 0; overflow-wrap:anywhere; }
                .amember-list li + li { border-top:1px solid #30363D; }
                .astatus { flex-shrink:0; padding:4px 9px; border-radius:999px; background:rgba(139,148,158,.12); border:1px solid rgba(139,148,158,.3); color:#8B949E; font-size:11px; font-weight:700; text-transform:capitalize; }
                .astatus-locked { background:rgba(248,81,73,.12); border-color:rgba(248,81,73,.3); color:#F85149; }
                .astatus-forming { background:rgba(0,201,167,.1); border-color:rgba(0,201,167,.3); color:#00C9A7; }
                @media (max-width:640px) {
                    .anav { padding:12px 16px; gap:12px; flex-wrap:wrap; }
                    .acontainer { padding:24px 16px; }
                    .aunits-grid { grid-template-columns:1fr; }
                }
            `}</style>
        </>
    )
}