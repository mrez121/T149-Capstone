// pages/admin/units/manage_teams
// Lists teams within a unit for the administrator to assign groups to

import { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from "next/link";
import AdminToast from "../../../components/AdminToast";

const SELECTED_UNIT_KEY = 'teamup.admin.manageGroups.unitId';
const DEFAULT_TEAM_FILTERS = {size: 'all', page: 1, pageSize: 25};

/**
 * @function ManageTeamsPage
 * Builds the Manage Teams page using react.js
 * @returns Manage Teams page HTML (if loading state = false) || Loading HTML (if loading state = true)
 */
export default function ManageTeamsPage() {

    const router = useRouter();
    const [allUnits, setAllUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [teams, setTeams] = useState([]);
    
    const [teamFilters, setTeamFilters] = useState(DEFAULT_TEAM_FILTERS);
    const [pagination, setPagination] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [groupError, setGroupError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [loadingTeams, setLoadingTeams] = useState(false);
    
    const teamsRequestRef = useRef(false);
    const addGroupRequestRef = useRef(null);
    const removeGroupRequestRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(toastTimerRef.current), []);

    /**
     * @function loadUnits
     * @async
     * Load all units from the database into the manage_teams page
     */
    async function loadUnits() {
        try {
            const res = await fetch('/api/admin/units');
            if(res.status === 401) {
                router.push('/');
                return;
            }
            if(res.status === 403) {
                router.push('/');
                return;
            }
            
            const data = await res.json();
            if(!res.ok) {
                showToast(data.error || 'Failed to load units. Please reload the page.', 'error');
                return;
            }

            const units = data.units || [];
            setAllUnits(units);

            let savedUnitId = null;
            try {
                savedUnitId = sessionStorage.getItem(SELECTED_UNIT_KEY);
            } catch {
                // Loading teams must still work when browser storage is unavailable
            }
            
        } catch {
            showToast('Unable to load units. Please reload the page.', 'error');
        } finally {
            setLoading(false);
        }
    }

    // Load content
    useEffect(() => {loadUnits();}, []);

    /**
     * @function showToast
     * Show a notification for four seconds, replacing the previous notification timer.
     * @param {*} msg - the message to be displayed
     * @param {*} type - the type of message
     */
    function showToast(msg, type = 'success') {
        clearTimeout(toastTimerRef.current);
        setToast({msg, type});
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    }

    /**
     * @function handleLogout
     * @async
     * Log out of the manage teams page and return to the login page
     */
    async function handleLogout() {
        await fetch('/api/auth/logout', {method: 'POST'});
        router.push('/');
    }

    /**
     * @function getTeams
     * @async
     * Get all teams in a specified unit in accordance with user provided filters
     * @param {*} unitId - the id of the unit to fetch teams for
     * @param {*} unitCode - the code/name of the unit to fetch teams for
     * @param {*} notify - whether to show a successful manual query notification
     * @param {*} nextFilters - filters and page to request; new courses use the defaults
     */
    async function getTeams(unitId, unitCode, notify = true, nextFilters = DEFAULT_TEAM_FILTERS) {
        // Keep an older list response from overwriting completed team operations (adding group, removing group).
        if(teamsRequestRef.current || addGroupRequestRef.current !== null || removeGroupRequestRef.current !== null) {
            return;
        }
        teamsRequestRef.current = true;
        setLoadingTeams(true);
        setTeamError(null);
        setSelectedUnitId(unitId);
        setSelectedUnit(unitCode);
        setTeamFilters(nextFilters);

        try {
            const query = new URLSearchParams({unit: unitId, ...nextFilters});
            const res = await fetch(`/api/admin/units/teams?${query}`, {method: 'GET'});
            const data = await res.json();
            if(!res.ok) {
                throw new Error(data.error || 'Failed to load teams. Please try again.');
            }

            setTeams(data.teams);
            setPagination(data.pagination);
            setTeamFilters({...nextFilters, page: data.pagination.page});

            try {
                sessionStorage.setItem(SELECTED_UNIT_KEY, String(unitId));
            } catch {
                // Current results remain usable without remembering the selection
            }
            if(notify) {
                showToast(`${unitCode} teams fetched.`);
            }
        } catch(error) {
            setTeams([]);
            setPagination(null);
            setTeamError(error.message || 'Unable to load teams. Please try again.');
        } finally {
            teamsRequestRef.current = false;
            setLoadingTeams(false);
        }
    }

    /**
     * @function deleteTeam
     * @async
     * delete a team from the specified unit
     * @param {*} teamId - id of the team to be deleted
     * @param {*} teamName - name of the team to be deleted
     * @param {*} unitId - id of the unit the team is in
     */
    async function deleteTeam(teamId, teamName, unitId) {
        if(!confirm(`Delete team ${teamName}? This cannot be undone.`)) {
            return;
        }
        
        try {
            const res = await fetch(`/api/admin/units/teams?team=${teamId}&name=${teamName}&unit=${unitId}`, {method: 'DELETE'});
            const data = await res.json();
            if(data.ok) {
                showToast(`Team ${teamName} deleted.`);
                loadUnits();
                getTeams(selectedUnitId, selectedUnit);
            }
            
        } catch {
            showToast('Unable to delete team. Please try again.', 'error');
        }        
    }


    // Loading graphic
    if(loading) return (
        <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
            Loading...
        </div>
    );

    return (
        <>
            <Head><title>TeamUp - Manage Teams</title></Head>
            <AdminToast toast={toast}/>

            <nav className="anav">
                <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
                <Link href='/tutor_dash' className="anav-link anav-button">← Dashboard</Link>
                <button className="logout-btn" onClick={handleLogout}>Sign out</button>
            </nav>

            <main className="acontainer">
                <div className="apage-header">
                    <div>
                        <h1 className="apage-title">Manage Teams</h1>
                        <p className="apage-sub">Select a unit to review its teams</p>
                    </div>
                </div>

                <section className="apage-section">
                    <div className="asection-header">
                        <div>
                            <h2 className="asection-title">Units</h2>
                            <p className="asection-sub">Choose a unit to load its current teams</p>
                        </div>
                    </div>

                    {/*Card construction for units - same design as units, enrolments, and groups pages */}
                    {allUnits.length == 0? (
                        <div className="aempty aempty-panel">
                            <div className="aempty-icon">🏫</div>
                            <div className="aempty-text">No units available</div>
                        </div>
                    ) : (
                        <div className="aunits-grid">
                            {allUnits.map(u => (
                                <div key={u.id} className="aunit-card">
                                    <div className="aunit-code">{u.unit_code}</div>
                                    <div className="aunit-name">{u.unit_name}</div>
                                    <div className="aunit-semester">{u.semester}</div>
                                    <div className="aunit-stats">
                                        <span>📁 {u.team_count || 0} teams</span>
                                        <span>📁 {u.locked_count || 0} locked groups</span>
                                    </div>
                                    <div className="aunit-actions">
                                        <button className="abtn abtn-blue" disabled={loadingTeams} onClick={() => getTeams(u.id, u.unit_code)}>{u.unit_code} Teams</button>
                                        <Link href={`/admin/units/${u.id}/add-team?unitCode=${u.unit_code}`} className="abtn abtn-teal abtn-sm">Add team</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/*List construct of teams in a unit */}
                <section className="apage-section">
                    <div className="asection-header">
                        <div>
                            <h2 className="asection-title">Team Results</h2>
                            <p className="asection-sub">
                                {loadingTeams ? 'Loading teams...' : selectedUnit ? `Teams in ${selectedUnit}` : `Select a unit above to view its teams`}
                            </p>
                        </div>
                    </div>

                    {selectedUnit && (
                        <div className="agroup-filters">
                            <label>Team size
                                <select value={teamFilters.size} disabled={loadingTeams}
                                onChange={e => getTeams(selectedUnitId, selectedUnit, false, {...teamFilters, size: e.target.value, page: 1})}>
                                    <option value='all'>All sizes</option>
                                    {[0, 1, 2, 3, 4, 5].map(size => <option key={size} value={size}>{size === 0 ? '0 (empty)': `${size} ${size === 1 ? 'member' : 'members'}`}</option>)}
                                <option value='6+'>6 or more members</option>
                                </select>
                            </label>
                            <label>Teams per page
                                <select value={teamFilters.pageSize} disabled={loadingTeams}
                                    onChange={e => getTeams(selectedUnitId, selectedUnit, false, {...teamFilters, pageSize: Number(e.target.value), page: 1})}>
                                    {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </label>
                            <button className="abtn abtn-ghost" disabled={loadingTeams}
                                onClick={() => getTeams(selectedUnitId, selectedUnit, false, {...DEFAULT_TEAM_FILTERS, pageSize: teamFilters.pageSize})}>Clear filters</button>
                            <button className="abtn abtn-ghost" disabled={loadingTeams}
                                onClick={() => getTeams(selectedUnitId, selectedUnit, false, teamFilters)}>Refresh teams</button>
                        </div>
                    )}

                    {loadingTeams || teamError || teams.length === 0 ? (
                        <div className="aempty aempty-panel aempty-compact">
                            <div className="aempty-icon">📁</div>
                            <div className="aempty-text" role={teamError ? 'alert' : 'status'}>
                                {loadingTeams ? 'Loading teams...' : teamError || (selectedUnit ? 'No teams match these filters. Clear filters or try another unit.' : 'Select a unit above to view its groups')}
                            </div>
                        </div>
                    ) : (
                        <div className="agroups-scroll" role="region" aria-label={`Teams in ${selectedUnit}`} tabIndex={0}>
                            <table className="agroups-table" aria-label={`Teams in ${selectedUnit}`} aria-busy={loadingTeams}>
                                <thead>
                                    <tr>
                                        <th scope='col'>Team</th>
                                        <th scope='col'>Size</th>
                                        <th scope='col'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map(e => (
                                        <Fragment key={e.team_id}>
                                            <tr>
                                                <th scope='row'>
                                                    <div className="adata-name">{e.name}</div>
                                                    <div className="adata-id">{e.team_id}</div>
                                                </th>
                                                <td>{e.current_size}</td>
                                                <td className="aunit-actions">
                                                    <Link
                                                        href={`/admin/units/${selectedUnitId}/teams/${e.team_id}/groups?name=${e.name}&unitCode=${selectedUnit}`}
                                                        className="abtn abtn-teal">
                                                        Add/Remove Groups
                                                    </Link>
                                                    <Link
                                                        href={`/admin/units/${selectedUnitId}/teams/${e.team_id}`}
                                                        className="abtn abtn-ghost">
                                                        {`Edit ${e.name}`}
                                                    </Link>
                                                    <button
                                                        className="abtn abtn-red"
                                                        disabled={loadingTeams}
                                                        onClick={() => deleteTeam(e.team_id, e.name, selectedUnitId)}>
                                                        {`Delete ${e.name}`}
                                                    </button>
                                                </td>
                                            </tr>
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {pagination && !loadingTeams && !teamError && (
                        <div className='agroup-pagination'>
                            <span role='status'>Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}-{Math.min(pagination.page *pagination.pageSize, pagination.total)} of {pagination.total} teams</span>
                            <div className='agroup-page-buttons'>
                                <button className="abtn abtn-ghost" disabled={pagination.page === 1}
                                    onClick={() => getTeams(selectedUnitId, selectedUnit, false, {...teamFilters, page: pagination.page - 1})}>Previous</button>
                                <span>Page {pagination.page} of {pagination.totalPages}</span>
                                <button className="abtn abtn-ghost" disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => getTeams(selectedUnitId, selectedUnit, false,  {...teamFilters, page: pagination.page + 1})}>Next</button>
                            </div>
                        </div>
                    )}
                </section>
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