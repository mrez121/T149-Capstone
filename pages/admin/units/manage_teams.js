// pages/admin/units/manage_teams
// Lists teams within a unit for the administrator to assign groups to

import { Fragment, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import Link from "next/link";
import AdminToast from "../../../components/AdminToast";

const SELECTED_UNIT_KEY = 'teamup.admin.manageGroups.unitId';
const DEFAULT_FILTERS = {status: 'all', size: 'all', page: 1, pageSize: 25};

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
    const [selectedTeam, setSelectedTeam] = useState(null);
    
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [pagination, setPagination] = useState(null);
    const [teamError, setTeamError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const toastTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(toastTimerRef.current), []);

    async function loadUnits() {
        try {
            const res = await fetch('/api/admin/units');
            if(res.status === 401) {
                router.push('/');
                return;
            }
            if(res.status === 403) {
                router.push('/tutor_dash');
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
                // Loading groups must still work when browser storage is unavailable
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
     * @param {*} msg 
     * @param {*} type 
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

    async function getTeams() {
    
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
                                        <span>📁 {u.group_count || 0} groups</span>
                                    </div>
                                    <div className="aunit-actions">
                                        <button className="abtn abtn-blue" disabled={loadingTeams} onClick={() => getTeams()}>{u.unit_code} Teams</button>
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
                </section>
            </main>
        </>
    )

}