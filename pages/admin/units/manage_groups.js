// pages/admin/units/manage_groups
// Lists groups within a unit with expandable members and the option to unlock a group

import {Fragment, useState, useEffect, useRef} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const SELECTED_UNIT_KEY = 'teamup.admin.manageGroups.unitId';
const DEFAULT_FILTERS = {status: 'all', size: 'all', page: 1, pageSize: 25};
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
     * @const expandedGroupId
     * @const filters
     * @const pagination
     * @const loading
     * @const toast
     * @const res
     * @const data
     */
    const router = useRouter();
    const [allUnits, setAllUnits] = useState([]);
    const [groups, setGroups] = useState([]);
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [selectedUnitId, setSelectedUnitId] = useState(null);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [pagination, setPagination] = useState(null);
    const [groupError, setGroupError] = useState(null);
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
     * Display request errors in the results area so the user can retry.
     * @param {*} unitId the unit to get the group data for
     * @param {*} unitCode the name of the unit for user readability purposes
     * @param {boolean} notify whether to show a successful manual-query notification
     * @param {*} nextFilters filters and page to request; new courses use the defaults
     * @param {boolean} keepExpanded whether to keep visible member details after an unlock
     */
    async function getGroups(unitId, unitCode, notify = true, nextFilters = DEFAULT_FILTERS, keepExpanded = false) {
        // Keep an older list response from overwriting a completed unlock.
        if (groupsRequestRef.current || unlockRequestRef.current !== null) return;
        groupsRequestRef.current = true;
        setLoadingGroups(true);
        setGroupError(null);
        setSelectedUnitId(unitId);
        setSelectedUnit(unitCode);
        setFilters(nextFilters);

        try {
            const query = new URLSearchParams({unit: unitId, ...nextFilters});
            const res = await fetch(`/api/admin/units/groups?${query}`, {method: 'GET'});
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to load groups. Please try again.');
            }

            setGroups(data.groups);
            setPagination(data.pagination);
            setFilters({...nextFilters, page: data.pagination.page});
            // Only retain expanded details when the refreshed group still matches the filters.
            setExpandedGroupId(current => keepExpanded && data.groups.some(group => group.group_id === current) ? current : null);
            try {
                sessionStorage.setItem(SELECTED_UNIT_KEY, String(unitId));
            } catch {
                // The current results remain usable without remembering the selection.
            }
            if (notify) showToast(`${unitCode} groups fetched.`);
        }
        catch (error) {
            setGroups([]);
            setPagination(null);
            setExpandedGroupId(null);
            setGroupError(error.message || 'Unable to load groups. Please try again.');
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
            // Refresh totals and the current page, including when a locked-only result disappears.
            unlockRequestRef.current = null;
            await getGroups(selectedUnitId, selectedUnit, false, filters, true);
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

                    {selectedUnit && (
                        <div className='agroup-filters'>
                            <label>Status
                                <select value={filters.status} disabled={loadingGroups || unlockingGroupId !== null}
                                    onChange={e => getGroups(selectedUnitId, selectedUnit, false, {...filters, status: e.target.value, page: 1})}>
                                    <option value='all'>All statuses</option>
                                    <option value='forming'>Forming</option>
                                    <option value='locked'>Locked</option>
                                </select>
                            </label>
                            <label>Group size
                                <select value={filters.size} disabled={loadingGroups || unlockingGroupId !== null}
                                    onChange={e => getGroups(selectedUnitId, selectedUnit, false, {...filters, size: e.target.value, page: 1})}>
                                    <option value='all'>All sizes</option>
                                    {[0, 1, 2, 3, 4, 5].map(size => <option key={size} value={size}>{size === 0 ? '0 (empty)' : `${size} ${size === 1 ? 'member' : 'members'}`}</option>)}
                                    <option value='6+'>6 or more members</option>
                                </select>
                            </label>
                            <label>Groups per page
                                <select value={filters.pageSize} disabled={loadingGroups || unlockingGroupId !== null}
                                    onChange={e => getGroups(selectedUnitId, selectedUnit, false, {...filters, pageSize: Number(e.target.value), page: 1})}>
                                    {[10, 25, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </label>
                            <button className='abtn abtn-ghost' disabled={loadingGroups || unlockingGroupId !== null}
                                onClick={() => getGroups(selectedUnitId, selectedUnit, false, {...DEFAULT_FILTERS, pageSize: filters.pageSize})}>Clear filters</button>
                            <button className='abtn abtn-ghost' disabled={loadingGroups || unlockingGroupId !== null}
                                onClick={() => getGroups(selectedUnitId, selectedUnit, false, filters)}>Refresh groups</button>
                        </div>
                    )}

                    {loadingGroups || groupError || groups.length === 0 ? (
                        <div className='aempty aempty-panel aempty-compact'>
                            <div className='aempty-icon'>📁</div>
                            <div className='aempty-text' role={groupError ? 'alert' : 'status'}>
                                {loadingGroups ? 'Loading groups...' : groupError || (selectedUnit ? 'No groups match these filters. Try another course or clear the filters.' : 'Select a unit above to view its groups')}
                            </div>
                        </div>
                    ) : (
                        <div className='agroups-scroll' role='region' aria-label={`Groups in ${selectedUnit}`} tabIndex={0}>
                            <table className='agroups-table' aria-label={`Groups in ${selectedUnit}`} aria-busy={loadingGroups}>
                                <thead>
                                    <tr>
                                        <th scope='col'>Group</th>
                                        <th scope='col'>Size</th>
                                        <th scope='col'>Status</th>
                                        <th scope='col'>Members</th>
                                        <th scope='col'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map(e => (
                                        <Fragment key={e.group_id}>
                                            <tr>
                                                <th scope='row'>
                                                    <div className='adata-name'>{e.name}</div>
                                                    <div className='adata-id'>{e.group_id}</div>
                                                </th>
                                                <td>{e.member_count}</td>
                                                <td><span className={`astatus astatus-${e.status}`}>{e.status}</span></td>
                                                <td>
                                                    <button className='abtn abtn-ghost'
                                                        aria-expanded={expandedGroupId === e.group_id}
                                                        aria-controls={`members-${e.group_id}`}
                                                        aria-label={`${expandedGroupId === e.group_id ? 'Hide' : 'View'} members of ${e.name}`}
                                                        disabled={loadingGroups}
                                                        onClick={() => setExpandedGroupId(current => current === e.group_id ? null : e.group_id)}>
                                                        {expandedGroupId === e.group_id ? 'Hide members' : 'View members'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button
                                                        className={`abtn ${e.status === 'locked' ? 'abtn-red' : 'abtn-ghost'}`}
                                                        disabled={e.status !== 'locked' || unlockingGroupId !== null || loadingGroups}
                                                        aria-busy={unlockingGroupId === e.group_id}
                                                        onClick={() => unlockGroup(e.group_id, e.name)}>
                                                        {unlockingGroupId === e.group_id ? 'Unlocking...' : e.status === 'locked' ? 'Unlock group' : 'Unlocked'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/*Keep member details in the same table, directly below their group.*/}
                                            <tr id={`members-${e.group_id}`} hidden={expandedGroupId !== e.group_id}>
                                                <td colSpan={5} className='agroup-details'>
                                                    <p className='agroup-creator'>Created by <strong>{e.created_by}</strong></p>
                                                    {e.members.length === 0 ? <p>No members in this group.</p> : (
                                                        <ul className='amember-list' aria-label={`Members of ${e.name}`}>
                                                            {e.members.map(member => (
                                                                <li key={member.student_id}>
                                                                    <strong>{member.name}</strong>
                                                                    <span>Student ID: {member.student_id}</span>
                                                                    <span>TeamUp ID: {member.teamup_id}</span>
                                                                    <span>{member.is_new ? 'New student' : 'Returning student'}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </td>
                                            </tr>
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {pagination && !loadingGroups && !groupError && (
                        <div className='agroup-pagination'>
                            <span role='status'>Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} groups</span>
                            <div className='agroup-page-buttons'>
                                <button className='abtn abtn-ghost' disabled={unlockingGroupId !== null || pagination.page === 1}
                                    onClick={() => getGroups(selectedUnitId, selectedUnit, false, {...filters, page: pagination.page - 1})}>Previous</button>
                                <span>Page {pagination.page} of {pagination.totalPages}</span>
                                <button className='abtn abtn-ghost' disabled={unlockingGroupId !== null || pagination.page >= pagination.totalPages}
                                    onClick={() => getGroups(selectedUnitId, selectedUnit, false, {...filters, page: pagination.page + 1})}>Next</button>
                            </div>
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
