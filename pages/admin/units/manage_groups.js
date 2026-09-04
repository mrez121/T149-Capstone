// pages/admin/units/manage_groups
// Lists all groups within a unit with the option to unlock a group

import {useState, useEffect, useRef} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const SELECTED_UNIT_KEY = 'teamup.admin.manageGroups.unitId';
/**
 * @function ManageGroupsPage
 * Builds the Manage Groups page using react.js
 * @returns Manage Groups page HTML (if loading state = false) || Loading HTML (if loading state = true)
 */
export default function ManageGroupsPage() {
    /**
     * @const router
     * @const allUnits
     * @const groups
     * @const loading
     * @const toast
     * @const res
     * @const data
     */
    const router = useRouter();
    const [allUnits, setAllUnits] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [unlockingGroupId, setUnlockingGroupId] = useState(null);
    const groupsRequestRef = useRef(false);
    const unlockRequestRef = useRef(null);
    const toastTimerRef = useRef(null);

    useEffect(() => () => clearTimeout(toastTimerRef.current), []);

    /**
     * @function loadUnits
     * @async
     * Fetch available units and restore the saved unit's groups on page load.
     * If no saved unit is available, load the only unit automatically when there is one.
     * Display request errors in a toast and clear loading when the request finishes.
     */
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
            if (!res.ok) {
                showToast(data.error || 'Failed to load units. Please reload the page.', 'error');
                return;
            }

            const units = data.units || [];
            setAllUnits(units);

            let savedUnitId = null;
            try {
                savedUnitId = sessionStorage.getItem(SELECTED_UNIT_KEY);
            } catch {
                // Loading groups must still work when browser storage is unavailable.
            }
            const unitToLoad = units.find(unit => String(unit.id) === savedUnitId)
                || (units.length === 1 ? units[0] : null);
            if (unitToLoad) {
                await getGroups(unitToLoad.id, unitToLoad.unit_code, false);
            }
        }
        catch {
            showToast('Unable to load units. Please reload the page.', 'error');
        }
        finally {
            setLoading(false);
        }
    }

    //Load content
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
     * @function getGroups
     * @async
     * Fetch and display a unit's groups, then remember the unit for page refreshes.
     * Show a success toast for manual queries; automatic restoration stays quiet.
     * If there is an error, display the error in a toast
     * @param {*} unitId the unit to get the group data for
     * @param {*} unitCode the name of the unit for user readability purposes
     * @param {boolean} notify whether to show a successful manual-query notification
     */
    async function getGroups(unitId, unitCode, notify = true) {
        // Keep an older list response from overwriting a completed unlock.
        if (groupsRequestRef.current || unlockRequestRef.current !== null) return;
        groupsRequestRef.current = true;
        setLoadingGroups(true);

        try {
            const res = await fetch(`/api/admin/units/groups?unit=${encodeURIComponent(unitId)}`, {method: 'GET'});
            const data = await res.json();
            if (!res.ok) {
                showToast(data.error || 'Failed to load groups. Please try again.', 'error');
                return;
            }

            setGroups(data.groups);
            setSelectedUnit(unitCode);
            try {
                sessionStorage.setItem(SELECTED_UNIT_KEY, String(unitId));
            } catch {
                // The current results remain usable without remembering the selection.
            }
            if (notify) showToast(`${unitCode} groups fetched.`);
        }
        catch {
            showToast('Unable to load groups. Please try again.', 'error');
        }
        finally {
            groupsRequestRef.current = false;
            setLoadingGroups(false);
        }
    }

    /**
     * @function unlockGroup
     * @async
     * Unlock a locked group and update its displayed status after API success.
     * Prevent duplicate requests and restore the action after a failed request.
     * @param {*} groupId the ID of the group to be unlocked
     * @param {*} groupName the name of the group for readability purposes
     */
    async function unlockGroup(groupId, groupName) {
        const group = groups.find(item => item.group_id === groupId);
        if (unlockRequestRef.current !== null || groupsRequestRef.current || group?.status !== 'locked') return;

        // The ref also guards clicks before React renders the disabled button.
        unlockRequestRef.current = groupId;
        setUnlockingGroupId(groupId);

        try {
            const res = await fetch(`/api/admin/units/groups?groupId=${encodeURIComponent(groupId)}`, {method: 'POST'});
            const data = await res.json();
            if (!res.ok || !data.ok) {
                showToast(data.error || 'Failed to unlock the group. Please try again.', 'error');
                return;
            }

            setGroups(current => current.map(item =>
                item.group_id === groupId ? {...item, status: 'forming'} : item
            ));
            showToast(`${groupName} successfully unlocked.`);
        }
        catch {
            showToast('Unable to unlock the group. Please try again.', 'error');
        }
        finally {
            unlockRequestRef.current = null;
            setUnlockingGroupId(null);
        }
    }

    /**
     * @function handleLogout
     * @async
     * Log out of the manage groups page and return to the login page
     */
    async function handleLogout() {
        await fetch('/api/auth/logout', {method: 'POST'});
        router.push('/');
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
            <Head><title>TeamUp - Manage Groups</title></Head>
            {toast && <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>{toast.msg}</div>}

            <nav className='anav'>
                <div className='anav-logo'>Team<span>Up</span> <span className='admin-tag'>Admin</span></div>
                <Link href='/tutor_dash' className='anav-link anav-button'>← Dashboard</Link>
                <button className='logout-btn' onClick={handleLogout}>Sign out</button>
            </nav>

            <main className='acontainer'>
                <div className='apage-header'>
                    <div>
                        <h1 className='apage-title'>Manage Groups</h1>
                        <p className='apage-sub'>Select a unit to review its groups and formation status</p>
                    </div>
                </div>

                <section className='apage-section'>
                    <div className='asection-header'>
                        <div>
                            <h2 className='asection-title'>Units</h2>
                            <p className='asection-sub'>Choose a unit to load its current groups</p>
                        </div>
                    </div>

                    {/*Card constructions for units - same design as units and enrolments page */}
                    {allUnits.length == 0 ? (
                        <div className='aempty aempty-panel'>
                            <div className='aempty-icon'>🏫</div>
                            <div className='aempty-text'>No units available</div>
                        </div>
                    ) : (
                        <div className='aunits-grid'>
                            {allUnits.map(u => (
                                <div key={u.id} className='aunit-card'>
                                    <div className='aunit-code'>{u.unit_code}</div>
                                    <div className='aunit-name'>{u.unit_name}</div>
                                    <div className='aunit-semester'>{u.semester}</div>
                                    <div className='aunit-stats'>
                                        <span>👤 {u.student_count || 0} students</span>
                                        <span>📁 {u.group_count || 0} groups</span>
                                    </div>
                                    <div className='aunit-actions'>
                                        <button className='abtn abtn-blue' disabled={loadingGroups || unlockingGroupId !== null} onClick={() => getGroups(u.id, u.unit_code)}>{u.unit_code} Groups</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/*List construct of groups in a unit */}
                <section className='apage-section'>
                    <div className='asection-header'>
                        <div>
                            <h2 className='asection-title'>Group Results</h2>
                            <p className='asection-sub'>
                                {loadingGroups ? 'Loading groups...' : selectedUnit ? `Groups in ${selectedUnit}` : 'Select a unit above to view its groups'}
                            </p>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <div className='aempty aempty-panel aempty-compact'>
                            <div className='aempty-icon'>📁</div>
                            <div className='aempty-text'>
                                {loadingGroups ? 'Loading groups...' : selectedUnit ? `No groups are available in ${selectedUnit}` : 'Select a unit above to view its groups'}
                            </div>
                        </div>
                    ) : (
                        <div className='aresults-grid'>
                            {groups.map(e => (
                                <div key={e.group_id} className='adata-card'>
                                    <div className='agroup-header'>
                                        <div>
                                            <div className='adata-name'>{e.name}</div>
                                            <div className='adata-id'>Group ID: {e.group_id}</div>
                                        </div>
                                        <span className={`astatus astatus-${e.status}`}>{e.status}</span>
                                    </div>
                                    <div className='adata-meta'>
                                        <span>Created by</span>
                                        <strong>{e.created_by}</strong>
                                    </div>
                                    <button
                                        className={`abtn ${e.status === 'locked' ? 'abtn-red' : 'abtn-ghost'}`}
                                        disabled={e.status !== 'locked' || unlockingGroupId !== null || loadingGroups}
                                        aria-busy={unlockingGroupId === e.group_id}
                                        onClick={() => unlockGroup(e.group_id, e.name)}
                                    >
                                        {unlockingGroupId === e.group_id ? 'Unlocking...' : e.status === 'locked' ? 'Unlock group' : 'Unlocked'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <style jsx global>{`
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
                .aresults-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:16px; }
                .adata-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:20px; }
                .agroup-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
                .adata-name { color:#E6EDF3; font-size:16px; font-weight:650; }
                .adata-id { color:#8B949E; font-family:monospace; font-size:13px; margin-top:4px; }
                .adata-meta { display:flex; flex-direction:column; gap:4px; margin:16px 0; padding-top:14px; border-top:1px solid #30363D; }
                .adata-meta span { color:#8B949E; font-size:12px; text-transform:uppercase; letter-spacing:.05em; }
                .adata-meta strong { color:#E6EDF3; font-size:13px; font-weight:500; overflow-wrap:anywhere; }
                .astatus { flex-shrink:0; padding:4px 9px; border-radius:999px; background:rgba(139,148,158,.12); border:1px solid rgba(139,148,158,.3); color:#8B949E; font-size:11px; font-weight:700; text-transform:capitalize; }
                .astatus-locked { background:rgba(248,81,73,.12); border-color:rgba(248,81,73,.3); color:#F85149; }
                .astatus-forming { background:rgba(0,201,167,.1); border-color:rgba(0,201,167,.3); color:#00C9A7; }
            `}</style>

        </>
    )
}
