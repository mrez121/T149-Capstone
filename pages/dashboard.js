// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [myGroup, setMyGroup] = useState(null);
  const [myMembers, setMyMembers] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [invites, setInvites] = useState([]);
  const [groupType, setGroupType] = useState('public');
  const [inviteTarget, setInviteTarget] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load the dashboard state from both personal group data and public groups.
  // This keeps the grouped and ungrouped dashboard views in sync after each action.
  async function loadData() {
    const [mineRes, pubRes] = await Promise.all([
      fetch('/api/groups/mine'),
      fetch('/api/groups'),
    ]);

    if (mineRes.status === 401) {
      router.push('/');
      return;
    }

    const mine = await mineRes.json();
    const pub = await pubRes.json();

    setStudent(mine.student || null);
    setMyGroup(mine.group || null);
    setMyMembers(mine.members || []);
    setMySlots(mine.slots || []);
    setInvites(mine.invites || []);
    setPublicGroups(pub.groups || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  // Reusable feedback helper for create, join, invite, lock and leave actions.
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  // Live constraint checks used by both the status card and the active group panel.
  const memberCount = myMembers.length;
  const newCount = myMembers.filter((m) => m.is_new).length;
  const sizeOk = memberCount >= 4 && memberCount <= 5;
  const newOk = newCount <= 2;
  const slotOk = !!myGroup?.shared_slot;
  const allOk = sizeOk && newOk && slotOk;
  // Separate minimum seats from total open seats so the UI can explain what is
  // still required versus what capacity remains.
  const seatsNeeded = Math.max(0, 4 - memberCount);
  const openSeats = Math.max(0, 5 - memberCount);

  // Only the group creator can send invitations or lock a forming group.
  const isCreator =
    myGroup &&
    student &&
    myGroup.created_by === student.studentId;

  // Create a new group for students who are not currently in one.
  async function handleCreate(e) {
    e.preventDefault();

    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: groupType }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(`${data.name} created.`);
      loadData();
    } else {
      showToast(data.error, 'error');
    }
  }

  // Join a public group directly from the available groups list.
  async function handleJoin(groupId) {
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Successfully joined the group.');
      loadData();
    } else {
      showToast(data.errors?.join(' ') || data.error, 'error');
    }
  }

  // Invite a student by ID from the active group action panel.
  async function handleInviteStudent(e) {
    e.preventDefault();

    const res = await fetch('/api/groups/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: myGroup.group_id,
        targetStudentId: inviteTarget,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message);
      setInviteTarget('');
    } else {
      showToast(data.errors?.join(' ') || data.error, 'error');
    }
  }

  // Accept or decline an invitation shown in the pending invite banner.
  async function handleRespondInvite(inviteId, action) {
    const res = await fetch('/api/groups/respond-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, action }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(
        action === 'accept'
          ? 'You joined the group!'
          : 'Invite declined.'
      );
      loadData();
    } else {
      showToast(data.errors?.join(' ') || data.error, 'error');
    }
  }

  // Lock a group once all team-size, new-student and shared-slot rules pass.
  async function handleLock() {
    const res = await fetch('/api/groups/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: myGroup.group_id }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('Group locked and confirmed valid!');
      loadData();
    } else {
      showToast(data.errors?.join(' ') || data.error, 'error');
    }
  }

  // Leave the current group after confirmation and then refresh dashboard data.
  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    const res = await fetch('/api/groups/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: myGroup.group_id }),
    });

    if (res.ok) {
      showToast('You have left the group.');
      setMyGroup(null);
      setMyMembers([]);
      loadData();
    }
  }

  // End the session and return the user to the login page.
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div
        style={{
          background: '#0D1117',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8B949E',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>TeamUp — Dashboard</title>
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
                  student.isNew
                    ? 'badge-amber'
                    : 'badge-green'
                }`}
              >
                {student.isNew
                  ? 'New Student'
                  : 'Returning'}
              </span>
            </span>
          )}

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="container">
        <h1 className="page-title">Dashboard</h1>

        <p className="page-subtitle">
          Manage your availability, group and team requirements.
        </p>

        {/* Student Directory entry point for both grouped and ungrouped students. */}
        <div className="directory-entry-card">
          <div className="directory-entry-copy">
            <div className="card-title teal">
              Student Directory
            </div>

            <p>
              Browse classmates, compare tutorial availability and
              find potential teammates from one place.
            </p>
          </div>

          <button
            className="btn btn-blue directory-entry-btn"
            type="button"
            onClick={() => router.push('/students')}
          >
            Open directory
          </button>
        </div>

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="invites-banner">
            <div className="invites-title">
              📬 Pending Group Invites
            </div>

            {invites.map((inv) => (
              <div key={inv.id} className="invite-row">
                <span>
                  <strong>{inv.from_name}</strong> has invited
                  you to join <strong>{inv.group_name}</strong>
                </span>

                <div className="invite-btns">
                  <button
                    className="btn btn-teal btn-sm"
                    onClick={() =>
                      handleRespondInvite(inv.id, 'accept')
                    }
                  >
                    Accept
                  </button>

                  <button
                    className="btn btn-red btn-sm"
                    onClick={() =>
                      handleRespondInvite(inv.id, 'decline')
                    }
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid">
          {/* My Tutorial Slots */}
          <div className="card tutorial-card">
            <div className="card-title teal">
              My Tutorial Slots
            </div>

            <div className="slot-list">
              {mySlots.length ? (
                mySlots.map((slot) => (
                  <span key={slot} className="slot">
                    {slot}
                  </span>
                ))
              ) : (
                <span className="muted">
                  No slots recorded
                </span>
              )}
            </div>

            <div className="card-divider" />

            <p className="card-helper">
              These are the times you are available for
              tutorials. Keep them up to date so teammates
              can find a shared time with you.
            </p>
          </div>

          {/* Constraint Status */}
          <div className="card constraint-card">
            <div className="card-title amber">
              Constraint Status
            </div>

            {myGroup ? (
              <>
                <div
                  className={`constraint-row ${
                    sizeOk ? 'c-ok' : 'c-fail'
                  }`}
                >
                  <span>
                    {sizeOk ? '✅' : '❌'} Team size
                  </span>

                  <span className="cv">
                    {memberCount} / 4–5 members
                  </span>
                </div>

                <div
                  className={`constraint-row ${
                    newOk ? 'c-ok' : 'c-fail'
                  }`}
                >
                  <span>
                    {newOk ? '✅' : '❌'} New students
                  </span>

                  <span className="cv">
                    {newCount} / max 2
                  </span>
                </div>

                <div
                  className={`constraint-row ${
                    slotOk ? 'c-ok' : 'c-fail'
                  }`}
                >
                  <span>
                    {slotOk ? '✅' : '❌'} Shared slot
                  </span>

                  <span className="cv">
                    {myGroup.shared_slot || 'Not found yet'}
                  </span>
                </div>

                {myGroup.status === 'forming' &&
                  (allOk ? (
                    <div className="all-ok">
                      🎉 All constraints met — ready to lock!
                    </div>
                  ) : (
                    <div className="not-ok">
                      Invite more members to meet all
                      constraints.
                    </div>
                  ))}

                {myGroup.status === 'locked' && (
                  <div className="all-ok">
                    🔒 Group locked and confirmed valid.
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="constraint-row c-info">
                  <span>👥 Team size</span>
                  <span className="cv">4–5 members</span>
                </div>

                <div className="constraint-row c-info">
                  <span>🎓 New students</span>
                  <span className="cv">
                    Max 2 per group
                  </span>
                </div>

                <div className="constraint-row c-info">
                  <span>🗓 Tutorial slot</span>
                  <span className="cv">
                    1+ shared slot
                  </span>
                </div>

                <p
                  className="muted"
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                  }}
                >
                  Join or create a group to see live
                  constraint checks.
                </p>
              </>
            )}
          </div>

          {/* My Group */}
          <div className="card full-width">
            <div className="card-title purple">
              My Group
            </div>
            
            {myGroup ? (
              /* Active group layout for students who have already joined or created a group. */
              <div className="active-group-layout">
                <div className="active-group-main">
                  <div className="active-group-hero">
                    <div>
                      <div className="group-kicker">
                        Current team
                      </div>
                      
                      <div className="group-name active-group-name">
                        {myGroup.name}
                      </div>

                      <div className="group-meta active-group-meta">
                        <span>{myGroup.group_id}</span>

                        <span
                          className={`badge ${
                            myGroup.status === 'locked'
                              ? 'badge-red'
                              : 'badge-blue'
                          }`}
                        >
                          {myGroup.status}
                        </span>

                        <span>
                          {myGroup.type === 'private'
                            ? '🔒 Private'
                            : '🌐 Public'}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`group-health-pill ${
                        allOk ? 'ready' : 'needs-work'
                      }`}
                    >
                      <strong>
                        {allOk ? 'Ready to lock' : 'Building team'}
                      </strong>

                      <span>
                        {seatsNeeded > 0
                          ? `${seatsNeeded} more needed`
                          : `${openSeats} open seat${
                              openSeats === 1 ? '' : 's'
                            }`}
                      </span>
                    </div>
                  </div>

                  <div className="group-progress-grid">
                    <div
                      className={`group-metric ${
                        sizeOk ? 'metric-ok' : 'metric-warn'
                      }`}
                    >
                      <span>Team size</span>
                      <strong>{memberCount}/5</strong>
                    </div>

                    <div
                      className={`group-metric ${
                        newOk ? 'metric-ok' : 'metric-warn'
                      }`}
                    >
                      <span>New students</span>
                      <strong>{newCount}/2</strong>
                    </div>

                    <div
                      className={`group-metric ${
                        slotOk ? 'metric-ok' : 'metric-warn'
                      }`}
                    >
                      <span>Shared slot</span>
                      <strong>
                        {myGroup.shared_slot || 'Missing'}
                      </strong>
                    </div>
                  </div>

                  <div className="active-members-heading">
                    <div>
                      <div className="section-label members-label">
                        Team seats
                      </div>

                      <p>
                        {memberCount} member{memberCount === 1 ? '' : 's'}
                        joined, {openSeats} seat
                        {openSeats === 1 ? '' : 's'} still open.
                      </p>
                    </div>

                    <span className="group-seat-count">
                      {memberCount}/5 filled
                    </span>
                  </div>

                  <div className="members-grid active-members-grid">
                    {myMembers.map((member) => (
                      <div
                        key={member.student_id}
                        className="member-card active-member-card"
                      >
                        <div className="avatar">
                          {member.name[0]}
                        </div>

                        <div className="member-info">
                          <div className="member-name">
                            {member.name}
                          </div>

                          <div className="member-id">
                            {member.student_id}
                          </div>
                        </div>

                        <span
                          className={`badge ${
                            member.is_new
                              ? 'badge-amber'
                              : 'badge-green'
                          }`}
                        >
                          {member.is_new ? 'New' : 'Returning'}
                        </span>
                      </div>
                    ))}

                    {/* Empty seat cards make the remaining group capacity visible at a glance. */}
                    {Array.from({ length: openSeats }).map(
                      (_, index) => (
                        <div
                          key={`open-seat-${index}`}
                          className="member-card active-member-card empty-seat-card"
                        >
                          <div className="avatar empty-seat-avatar">
                            +
                          </div>

                          <div className="member-info">
                            <div className="member-name">
                              Open seat
                            </div>

                            <div className="member-id">
                              Invite or browse students
                            </div>
                          </div>

                          <span className="badge badge-blue">
                            Slot {memberCount + index + 1}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <aside className="active-group-side">
                  <div className="group-action-panel">
                    <div className="section-label">
                      Group actions
                    </div>

                    {/* Repeat the key formation checks beside the actions so the next step is clear. */}
                    <div className="formation-checklist">
                      <div
                        className={`formation-check ${
                          sizeOk ? 'complete' : 'attention'
                        }`}
                      >
                        <span>Team size</span>
                        <strong>{memberCount}/4 minimum</strong>
                      </div>

                      <div
                        className={`formation-check ${
                          newOk ? 'complete' : 'attention'
                        }`}
                      >
                        <span>New-student limit</span>
                        <strong>{newCount}/2 used</strong>
                      </div>

                      <div
                        className={`formation-check ${
                          slotOk ? 'complete' : 'attention'
                        }`}
                      >
                        <span>Shared tutorial</span>
                        <strong>
                          {myGroup.shared_slot || 'Not matched'}
                        </strong>
                      </div>
                    </div>

                    {isCreator &&
                    myGroup.status === 'forming' ? (
                      <>
                        <p className="action-help">
                          Invite classmates by student ID, or browse
                          the directory to find available teammates.
                        </p>

                        <form
                          onSubmit={handleInviteStudent}
                          className="invite-section active-invite-section"
                        >
                          <input
                            className="text-input"
                            placeholder="Student ID e.g. n10000003"
                            value={inviteTarget}
                            onChange={(e) =>
                              setInviteTarget(e.target.value)
                            }
                            required
                          />

                          <button
                            className="btn btn-blue"
                            type="submit"
                          >
                            Send invite
                          </button>
                        </form>
                      </>
                    ) : (
                      <p className="action-help">
                        {myGroup.status === 'locked'
                          ? 'This group is locked and confirmed.'
                          : 'Only the group creator can send invitations.'}
                      </p>
                    )}

                    <div className="active-action-row">
                      <button
                        className="btn btn-teal"
                        type="button"
                        onClick={() => router.push('/students')}
                      >
                        Browse students
                      </button>

                      {myGroup.status === 'forming' && (
                        <>
                          {isCreator && allOk && (
                            <button
                              className="btn btn-blue"
                              type="button"
                              onClick={handleLock}
                            >
                              Lock group
                            </button>
                          )}

                          <button
                            className="btn btn-red"
                            type="button"
                            onClick={handleLeave}
                          >
                            Leave group
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="empty-group-layout">
                <div className="empty-group-copy">
                  <div
                    className="empty-icon-wrap"
                    aria-hidden="true"
                  >
                    <span className="empty-icon">
                      👥
                    </span>
                  </div>

                  <div>
                    <div className="empty-title">
                      You are not in a group yet.
                    </div>

                    <p className="muted">
                      Create a group and invite your
                      teammates. Find other students to form a group with,
                      or browse public groups below.
                    </p>
                    <button
                        className="btn btn-teal"
                        type="button"
                        onClick={() => router.push('/students')}
                      >
                        Browse students
                      </button>
                  </div>
                </div>

                <form
                  onSubmit={handleCreate}
                  className="create-group-panel"
                >
                  <div className="section-label">
                    Create a new group
                  </div>

                  <div
                    className="group-type-toggle"
                    role="group"
                    aria-label="Group type"
                  >
                    <button
                      type="button"
                      className={`group-type-option ${
                        groupType === 'public'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setGroupType('public')
                      }
                    >
                      <span aria-hidden="true">🌐</span>

                      <span>
                        <strong>Public</strong> — anyone can
                        request to join
                      </span>
                    </button>

                    <button
                      type="button"
                      className={`group-type-option ${
                        groupType === 'private'
                          ? 'active'
                          : ''
                      }`}
                      onClick={() =>
                        setGroupType('private')
                      }
                    >
                      <span aria-hidden="true">🔒</span>

                      <span>
                        <strong>Private</strong> — invite
                        only
                      </span>
                    </button>
                  </div>

                  <div className="create-group-footer">
                    <p className="form-help">
                      Once created, invite teammates by their
                      student ID from your group panel.
                    </p>

                    <button
                      className="btn btn-blue"
                      type="submit"
                    >
                      Create group
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Public Groups */}
          {!myGroup && (
            <div className="card full-width">
              <div className="card-title blue">
                Available Public Groups
              </div>

              {publicGroups.length === 0 ? (
                <div className="empty-public-state">
                  <div
                    className="public-empty-icon"
                    aria-hidden="true"
                  >
                    👥
                  </div>

                  <div className="empty-title">
                    No public groups available yet.
                  </div>

                  <p className="muted">
                    Check back later or create your own group
                    above.
                  </p>
                </div>
              ) : (
                publicGroups.map((group) => (
                  <div
                    key={group.group_id}
                    className="public-group"
                  >
                    <div>
                      <div className="pg-name">
                        {group.name}
                      </div>

                      <div className="pg-meta">
                        <span className="pg-id">
                          {group.group_id}
                        </span>

                        <span
                          className={
                            group.member_count >= 4
                              ? 'warn'
                              : 'ok'
                          }
                        >
                          👥 {group.member_count}/5 members
                        </span>

                        <span
                          className={
                            group.new_count >= 2
                              ? 'warn'
                              : 'ok'
                          }
                        >
                          🎓 {group.new_count}/2 new
                        </span>

                        {group.shared_slot && (
                          <span className="slot">
                            {group.shared_slot}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn btn-blue btn-sm"
                      onClick={() =>
                        handleJoin(group.group_id)
                      }
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
