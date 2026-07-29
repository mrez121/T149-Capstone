// pages/students.js
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const filterOptions = [
  { value: 'all', label: 'All students' },
  { value: 'available', label: 'Available' },
  { value: 'in-group', label: 'In a group' },
  { value: 'new', label: 'New students' },
  { value: 'returning', label: 'Returning' },
];

export default function StudentDirectory() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [myGroup, setMyGroup] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState(null);

  async function loadData() {
    const [directoryRes, mineRes] = await Promise.all([
      fetch('/api/students'),
      fetch('/api/groups/mine'),
    ]);

    if (directoryRes.status === 401 || mineRes.status === 401) {
      router.push('/');
      return;
    }

    const directoryData = await directoryRes.json();
    const mineData = await mineRes.json();

    setStudent(directoryData.student || null);
    setStudents(directoryData.students || []);
    setMyGroup(mineData.group || null);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function handleInvite(targetStudentId) {
    if (!myGroup) return;

    setInvitingId(targetStudentId);

    const res = await fetch('/api/groups/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: myGroup.group_id,
        targetStudentId,
      }),
    });

    const data = await res.json();
    setInvitingId(null);

    if (res.ok) {
      showToast(data.message || 'Invite sent.');
    } else {
      showToast(data.errors?.join(' ') || data.error, 'error');
    }
  }

  const isCreator =
    myGroup &&
    student &&
    myGroup.created_by === student.studentId &&
    myGroup.status === 'forming';

  const stats = useMemo(() => {
    const available = students.filter((item) => !item.group).length;
    const inGroups = students.length - available;
    const newStudents = students.filter((item) => item.isNew).length;

    return {
      total: students.length,
      available,
      inGroups,
      newStudents,
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((item) => {
      const searchable = [
        item.name,
        item.studentId,
        item.email,
        item.cohort,
        ...item.slots,
      ]
        .join(' ')
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchable.includes(normalizedQuery);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'available' && !item.group) ||
        (filter === 'in-group' && item.group) ||
        (filter === 'new' && item.isNew) ||
        (filter === 'returning' && !item.isNew);

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, students]);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading student directory...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TeamUp — Student Directory</title>
      </Head>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <nav>
        <div className="logo">
          Team<span>Up</span>
        </div>

        <div className="nav-right">
          {student && (
            <span className="nav-name">
              {student.name}
              <span
                className={`badge ${
                  student.isNew ? 'badge-amber' : 'badge-green'
                }`}
              >
                {student.isNew ? 'New Student' : 'Returning'}
              </span>
            </span>
          )}

          <button
            type="button"
            className="directory-nav-link"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="container directory-page">
        <section className="directory-hero">
          <div>
            <h1 className="page-title">Student Directory</h1>
            <p className="page-subtitle">
              Browse classmates, compare tutorial availability and find
              teammates who can fit your group constraints.
            </p>
          </div>

          {myGroup ? (
            <div className="directory-current-group">
              <span className="section-label">Current group</span>
              <strong>{myGroup.name}</strong>
              <span>
                {myGroup.group_id} · {myGroup.status}
              </span>
            </div>
          ) : (
            <div className="directory-current-group">
              <span className="section-label">Current group</span>
              <strong>Not in a group</strong>
              <span>Create one from the dashboard to send invites.</span>
            </div>
          )}
        </section>

        <section className="directory-stats-grid" aria-label="Directory summary">
          <div className="directory-stat-card">
            <span>Total students</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="directory-stat-card">
            <span>Available</span>
            <strong>{stats.available}</strong>
          </div>
          <div className="directory-stat-card">
            <span>In groups</span>
            <strong>{stats.inGroups}</strong>
          </div>
          <div className="directory-stat-card">
            <span>New students</span>
            <strong>{stats.newStudents}</strong>
          </div>
        </section>

        <section className="card directory-controls">
          <label className="directory-search-label" htmlFor="student-search">
            Search student directory
          </label>

          <div className="directory-toolbar">
            <input
              id="student-search"
              className="text-input directory-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, student ID, cohort or tutorial slot"
            />

            <div className="directory-filter-group" aria-label="Student filter">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`directory-filter ${
                    filter === option.value ? 'active' : ''
                  }`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="directory-results">
          <div className="directory-results-header">
            <div className="card-title teal">Browse students</div>
            <span>{filteredStudents.length} matching</span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="card directory-empty-state">
              <div className="empty-title">No students match this search.</div>
              <p className="muted">
                Try another name, cohort or tutorial slot.
              </p>
            </div>
          ) : (
            <div className="directory-grid">
              {filteredStudents.map((item) => {
                const isCurrentStudent =
                  student?.studentId === item.studentId;
                const canInvite =
                  isCreator && !item.group && !isCurrentStudent;

                return (
                  <article
                    key={item.studentId}
                    className="directory-student-card"
                  >
                    <div className="directory-student-top">
                      <div className="directory-avatar">
                        {item.name[0]}
                      </div>

                      <div className="directory-student-main">
                        <div className="directory-name-row">
                          <h2>{item.name}</h2>
                          {isCurrentStudent && (
                            <span className="badge badge-blue">
                              You
                            </span>
                          )}
                        </div>

                        <p>{item.studentId}</p>
                      </div>

                      <span
                        className={`badge ${
                          item.isNew ? 'badge-amber' : 'badge-green'
                        }`}
                      >
                        {item.isNew ? 'New' : 'Returning'}
                      </span>
                    </div>

                    <div className="directory-detail-list">
                      <div>
                        <span>Cohort</span>
                        <strong>{item.cohort}</strong>
                      </div>

                      <div>
                        <span>Group status</span>
                        <strong>
                          {item.group ? item.group.name : 'Available'}
                        </strong>
                      </div>
                    </div>

                    <div className="directory-slots">
                      {item.slots.map((slot) => (
                        <span key={slot} className="slot">
                          {slot}
                        </span>
                      ))}
                    </div>

                    <div className="directory-card-footer">
                      <span>{item.email}</span>

                      {canInvite ? (
                        <button
                          type="button"
                          className="btn btn-blue btn-sm"
                          disabled={invitingId === item.studentId}
                          onClick={() => handleInvite(item.studentId)}
                        >
                          {invitingId === item.studentId
                            ? 'Sending...'
                            : 'Invite'}
                        </button>
                      ) : (
                        <span
                          className={`directory-status ${
                            item.group ? 'is-busy' : 'is-open'
                          }`}
                        >
                          {isCurrentStudent
                            ? 'Current user'
                            : item.group
                              ? item.group.status
                              : 'Open'}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
