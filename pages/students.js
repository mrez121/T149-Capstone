import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, CircleAlert, LoaderCircle, LogOut, RotateCcw,
  Search, UserRound, UserRoundPlus, UsersRound, X,
} from 'lucide-react';
import styles from '../styles/StudentDirectory.module.css';
import { sendGroupInvite } from '../lib/invite';

const INITIAL_FILTERS = {
  q: '', status: 'all', experience: 'all', cohort: '', slot: '', sort: 'name-asc', page: 1, pageSize: 25,
};

/**
 * @function StudentDirectory
 * Displays a server-paginated directory and keeps invitation actions tied to the current group.
 * @returns Student Directory HTML
 */
export default function StudentDirectory() {
  const router = useRouter();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [myGroup, setMyGroup] = useState(null);
  const [groupError, setGroupError] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState(null);
  const [invitingId, setInvitingId] = useState(null);
  const [invited, setInvited] = useState([]);
  const [pageInput, setPageInput] = useState('1');
  const [expandedSlots, setExpandedSlots] = useState([]);
  const toastTimer = useRef(null);
  const inviteLock = useRef(false);
  const requestKey = new URLSearchParams(filters).toString();

  // Debounce typing; the server searches all matching students, not only this page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => current.q === search.trim() ? current : { ...current, q: search.trim(), page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadDirectory() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/students?' + requestKey, { signal: controller.signal });
        if (response.status === 401) { router.replace('/'); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load the student directory.');
        if (controller.signal.aborted) return;
        setResult({ ...data, requestKey });
        setPageInput(String(data.pagination.page));
        setExpandedSlots([]);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message || 'Unable to load the student directory.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDirectory();
    return () => controller.abort();
  }, [requestKey, refresh, router]);

  const studentId = result?.student?.studentId;
  useEffect(() => {
    if (!studentId) return;
    const controller = new AbortController();
    async function loadGroup() {
      setGroupLoading(true);
      setGroupError('');
      try {
        const response = await fetch('/api/groups/mine', { signal: controller.signal });
        if (response.status === 401) { router.replace('/'); return; }
        const data = await response.json();
        if (!response.ok) throw new Error('Group information is unavailable. Invitations are temporarily unavailable.');
        if (!controller.signal.aborted) setMyGroup(data.group || null);
      } catch (err) {
        if (!controller.signal.aborted) {
          setMyGroup(null);
          setGroupError('Group information is unavailable. Invitations are temporarily unavailable.');
        }
      } finally {
        if (!controller.signal.aborted) setGroupLoading(false);
      }
    }
    loadGroup();
    return () => controller.abort();
  }, [studentId, refresh, router]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /**
   * @function changeFilter
   * Reset the page whenever a filter or page size changes, so results cannot appear falsely empty
   * @param {*} key - the filter key
   * @param {*} value - the filter value
   */
  function changeFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  }

  /**
   * @function clearFilters
   * Reset the filters on the page to their default values.
   */
  function clearFilters() {
    setSearch('');
    setFilters((current) => ({ ...INITIAL_FILTERS, pageSize: current.pageSize, sort: current.sort }));
  }

  /**
   * @function showToast
   * Show a temporary notification
   * @param {*} message - the message to be displayed
   * @param {*} type - the type of message to be displayed
   */
  function showToast(message, type = 'success') {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }

  /**
   * @function handleLogout
   * @async
   * Sign the user out of TeamUp and return them to the login page
   */
  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      router.push('/');
    } catch {
      showToast('Unable to sign out. Please try again.', 'error');
    }
  }

  const student = result?.student;
  const isCreator = Boolean(myGroup && student &&
    myGroup.created_by === student.studentId && myGroup.status === 'forming');

  /**
   * @function handleInvite
   * @async
   * Send a group invite to the target student.
   * Preserve the existing invite API and prevent duplicate submissions while a request is pending.
   * @param {*} targetTeamUpId - the TeamUp ID of the student being invited.
   */
  async function handleInvite(targetTeamUpId) {
    if (!isCreator || inviteLock.current) return;
    inviteLock.current = true;
    setInvitingId(targetTeamUpId);
    try {
      const data = await sendGroupInvite(myGroup.group_id, targetTeamUpId);
      setInvited((current) => [...current, targetTeamUpId]);
      showToast(data.warning || data.message || 'Invite sent.', data.warning ? 'warning' : 'success');
    } catch (err) {
      showToast(err.message || 'Unable to send invite. Please try again.', 'error');
      if (err.status === 401) router.replace('/');
    } finally {
      inviteLock.current = false;
      setInvitingId(null);
    }
  }

  const busy = loading || (!error && result?.requestKey !== requestKey) || search.trim() !== filters.q;
  const pagination = result?.pagination || { page: 1, pageSize: filters.pageSize, total: 0, totalPages: 1 };
  const stats = result?.stats;
  const hasFilters = Boolean(search || filters.status !== 'all' || filters.experience !== 'all' || filters.cohort || filters.slot);
  const start = pagination.total ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const end = Math.min(pagination.page * pagination.pageSize, pagination.total);

  /**
   * @function goToPage
   * Go to the specified page in the results list for the student directory.
   * @param {*} page - the page to go to.
   */
  function goToPage(page) {
    if (busy || error) return;
    setFilters((current) => ({ ...current, page: Math.max(1, Math.min(page, pagination.totalPages)) }));
  }

  return (
    <div className={styles.root}>
      <Head><title>TeamUp - Student Directory</title></Head>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link href="/dashboard" className={styles.logo}>Team<span>Up</span></Link>
        <div className={styles.navActions}>
          {student && <span className={styles.signedIn}>{student.name}</span>}
          <Link href="/dashboard" className={styles.navLink}><ArrowLeft size={16} /> Dashboard</Link>
          <button type="button" className={styles.iconButton} onClick={handleLogout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button>
        </div>
      </nav>

      <main className={styles.main}>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>{result?.unit || 'Students'}</p><h1>Student Directory</h1></div>
          <Link href="/dashboard" className={styles.currentGroup}>
            <UsersRound size={19} />
            <span><small>My group</small><strong>{groupLoading ? 'Loading...' : groupError ? 'Unavailable' : myGroup?.name || 'Not in a group'}</strong></span>
            <ChevronRight size={16} />
          </Link>
        </header>

        <dl className={styles.stats} aria-label="Directory summary">
          {[
            ['Total students', stats?.total, styles.total],
            ['Available', stats?.available, styles.available],
            ['In groups', stats?.inGroups, styles.grouped],
            ['New students', stats?.newStudents, styles.newStudents],
          ].map(([label, value, color]) => <div key={label}><dt>{label}</dt><dd className={color}>{value ?? '-'}</dd></div>)}
        </dl>

        <section className={styles.controls} aria-label="Directory filters">
          <div className={styles.searchRow}>
            <label className={styles.searchBox}>
              <Search size={19} aria-hidden="true" />
              <input aria-label="Search students" type="search" placeholder="Search name, ID, email or tutorial" maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <label className={styles.sortLabel}>Sort
              <select aria-label="Sort students" value={filters.sort} onChange={(event) => changeFilter('sort', event.target.value)}>
                <option value="name-asc">Name A to Z</option><option value="name-desc">Name Z to A</option><option value="id-asc">Student ID</option>
              </select>
            </label>
          </div>
          <div className={styles.filterRow}>
            <label>Group status<select aria-label="Group status" value={filters.status} onChange={(event) => changeFilter('status', event.target.value)}>
              <option value="all">All statuses</option><option value="available">Available</option><option value="grouped">In a group</option>
            </select></label>
            <label>Student type<select aria-label="Student type" value={filters.experience} onChange={(event) => changeFilter('experience', event.target.value)}>
              <option value="all">All students</option><option value="new">New</option><option value="returning">Returning</option>
            </select></label>
            <label>Cohort<select aria-label="Cohort" value={filters.cohort} onChange={(event) => changeFilter('cohort', event.target.value)}>
              <option value="">All cohorts</option>{result?.filters?.cohorts.map((cohort) => <option key={cohort} value={cohort}>{cohort}</option>)}
            </select></label>
            <label>Tutorial<select aria-label="Tutorial" value={filters.slot} onChange={(event) => changeFilter('slot', event.target.value)}>
              <option value="">All tutorials</option>{result?.filters?.slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select></label>
            <button type="button" className={styles.resetButton} disabled={!hasFilters} onClick={clearFilters}><RotateCcw size={15} /> Clear filters</button>
          </div>
        </section>

        {groupError && <div className={styles.warning} role="status"><CircleAlert size={18} /><span>{groupError}</span><button type="button" onClick={() => setRefresh((value) => value + 1)}>Retry</button></div>}

        <section className={styles.results} aria-label="Students">
          <div className={styles.resultBar}>
            <h2>Classmates <span>{pagination.total}</span></h2>
            <span className={styles.resultStatus} role="status" aria-live="polite">{busy ? <><LoaderCircle size={15} className={styles.spin} /> Loading students...</> : error ? 'Directory unavailable' : start + '-' + end + ' of ' + pagination.total + ' students'}</span>
          </div>

          {error ? (
            <div className={styles.empty} role="alert"><CircleAlert size={30} /><h3>Unable to load students</h3><p>{error}</p><button type="button" className={styles.primaryButton} onClick={() => setRefresh((value) => value + 1)}><RotateCcw size={16} /> Retry</button><Link href="/dashboard">Back to Dashboard</Link></div>
          ) : !result ? (
            <div className={styles.empty}><LoaderCircle size={28} className={styles.spin} /><p>Loading student directory...</p></div>
          ) : result.students.length === 0 ? (
            <div className={styles.empty}><UsersRound size={32} /><h3>{hasFilters ? 'No matching students' : 'No students available'}</h3>{hasFilters && <button type="button" className={styles.primaryButton} onClick={clearFilters}><RotateCcw size={16} /> Clear filters</button>}</div>
          ) : (
            <div className={styles.tableWrap} aria-busy={busy}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Students in {result.unit}</caption>
                <thead><tr><th scope="col">Student</th><th scope="col">Cohort</th><th scope="col">Type</th><th scope="col">Group</th><th scope="col">Tutorial availability</th><th scope="col"><span className={styles.srOnly}>Actions</span></th></tr></thead>
                <tbody>{result.students.map((item) => {
                  const isCurrentStudent = student?.studentId === item.studentId;
                  const canInvite = isCreator && !groupLoading && !groupError && !item.group && !isCurrentStudent && item.teamupId;
                  const sent = invited.includes(item.teamupId);
                  const expanded = expandedSlots.includes(item.studentId);
                  return <tr key={item.studentId}>
                    <td className={styles.studentCell}>
                      <div className={styles.identity}>
                        <span className={styles.avatar} aria-hidden="true">{item.name?.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('') || <UserRound size={18} />}</span>
                        <div><div className={styles.nameLine}>{item.teamupId ? <Link href={'/students/' + encodeURIComponent(item.teamupId)}>{item.name}</Link> : <strong>{item.name}</strong>}{isCurrentStudent && <span className={styles.you}>You</span>}</div><p>{item.studentId}<span> / {item.teamupId || 'No TeamUp ID'}</span></p><p className={styles.email} title={item.email}>{item.email}</p></div>
                      </div>
                    </td>
                    <td className={styles.cohortCell}><span className={styles.mobileLabel}>Cohort</span>{item.cohort || '-'}</td>
                    <td className={styles.typeCell}><span className={item.isNew ? styles.newBadge : styles.returningBadge}>{item.isNew ? 'New' : 'Returning'}</span></td>
                    <td className={styles.groupCell}><span className={styles.mobileLabel}>Group</span>{item.group ? <div><strong>{item.group.name}</strong><small className={styles.groupStatus}>{item.group.status === 'locked' ? 'Locked' : 'Forming'}</small></div> : <span className={styles.availableStatus}>Available</span>}</td>
                    <td className={styles.slotsCell}>
                      <div className={styles.slots}>{(expanded ? item.slots : item.slots.slice(0, 2)).map((slot) => <span key={slot} className={styles.slot}><CalendarDays size={12} />{slot}</span>)}
                        {!item.slots.length && <span className={styles.muted}>Not set</span>}
                        {item.slots.length > 2 && <button type="button" className={styles.moreSlots} aria-expanded={expanded} aria-label={(expanded ? 'Show fewer tutorials for ' : 'Show all tutorials for ') + item.name} onClick={() => setExpandedSlots((current) => expanded ? current.filter((id) => id !== item.studentId) : [...current, item.studentId])}>{expanded ? 'Less' : '+' + (item.slots.length - 2)}</button>}
                      </div>
                    </td>
                    <td className={styles.actionsCell}><div className={styles.rowActions}>
                      {item.teamupId && <Link className={styles.iconButton} href={'/students/' + encodeURIComponent(item.teamupId)} aria-label={'View profile of ' + item.name} title="View profile"><UserRound size={17} /></Link>}
                      {canInvite && <button type="button" className={sent ? styles.sentButton : styles.inviteButton} disabled={sent || Boolean(invitingId) || busy} title={sent ? 'Invite sent' : 'Invite to your group'} aria-label={(sent ? 'Invite sent to ' : 'Invite ') + item.name} onClick={() => handleInvite(item.teamupId)}>{invitingId === item.teamupId ? <LoaderCircle size={16} className={styles.spin} /> : sent ? <Check size={16} /> : <UserRoundPlus size={16} />}<span>{sent ? 'Sent' : 'Invite'}</span></button>}
                    </div></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}

          <footer className={styles.pagination}>
            <label>Rows per page<select aria-label="Rows per page" value={filters.pageSize} onChange={(event) => changeFilter('pageSize', Number(event.target.value))}>{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
            <div className={styles.pageControls}>
              <button type="button" className={styles.iconButton} title="First page" aria-label="First page" disabled={busy || Boolean(error) || pagination.page <= 1} onClick={() => goToPage(1)}><ChevronsLeft size={17} /></button>
              <button type="button" className={styles.iconButton} title="Previous page" aria-label="Previous page" disabled={busy || Boolean(error) || pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}><ChevronLeft size={17} /></button>
              <form onSubmit={(event) => { event.preventDefault(); const page = Number(pageInput); if (Number.isInteger(page)) goToPage(page); }}>
                <label>Page<input type="number" aria-label="Page number" min="1" max={pagination.totalPages} required value={pageInput} onChange={(event) => setPageInput(event.target.value)} disabled={busy || Boolean(error)} /></label><span>of {pagination.totalPages}</span>
                <button type="submit" className={styles.iconButton} title="Go to page" aria-label="Go to page" disabled={busy || Boolean(error) || !pageInput || Number(pageInput) === pagination.page}><ArrowRight size={15} /></button>
              </form>
              <button type="button" className={styles.iconButton} title="Next page" aria-label="Next page" disabled={busy || Boolean(error) || pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}><ChevronRight size={17} /></button>
              <button type="button" className={styles.iconButton} title="Last page" aria-label="Last page" disabled={busy || Boolean(error) || pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.totalPages)}><ChevronsRight size={17} /></button>
            </div>
          </footer>
        </section>
      </main>
      {toast && <div className={toast.type === 'error' ? styles.errorToast : toast.type === 'warning' ? styles.warningToast : styles.toast} role={toast.type === 'error' ? 'alert' : 'status'} aria-atomic="true"><span>{toast.message}</span><button type="button" className={styles.iconButton} aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button></div>}
    </div>
  );
}
