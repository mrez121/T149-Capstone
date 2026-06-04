// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [student,      setStudent]      = useState(null);
  const [myGroup,      setMyGroup]      = useState(null);
  const [myMembers,    setMyMembers]    = useState([]);
  const [mySlots,      setMySlots]      = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [invites,      setInvites]      = useState([]);
  const [groupType,    setGroupType]    = useState('public');
  const [inviteTarget, setInviteTarget] = useState('');
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  async function loadData() {
    const [mineRes, pubRes] = await Promise.all([
      fetch('/api/groups/mine'),
      fetch('/api/groups'),
    ]);
    if (mineRes.status === 401) { router.push('/'); return; }
    const mine = await mineRes.json();
    const pub  = await pubRes.json();
    setStudent(mine.student   || null);
    setMyGroup(mine.group     || null);
    setMyMembers(mine.members || []);
    setMySlots(mine.slots     || []);
    setInvites(mine.invites   || []);
    setPublicGroups(pub.groups || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  }

  // Live constraint checks
  const memberCount = myMembers.length;
  const newCount    = myMembers.filter(m => m.is_new).length;
  const sizeOk      = memberCount >= 4 && memberCount <= 5;
  const newOk       = newCount <= 2;
  const slotOk      = !!myGroup?.shared_slot;
  const allOk       = sizeOk && newOk && slotOk;
  const isCreator   = myGroup && student && myGroup.created_by === student.studentId;

  async function handleCreate(e) {
    e.preventDefault();
    const res  = await fetch('/api/groups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: groupType }),
    });
    const data = await res.json();
    if (res.ok) { showToast(`${data.name} created.`); loadData(); }
    else        { showToast(data.error, 'error'); }
  }

  async function handleJoin(groupId) {
    const res  = await fetch('/api/groups/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId }),
    });
    const data = await res.json();
    if (res.ok) { showToast('Successfully joined the group.'); loadData(); }
    else        { showToast(data.errors?.join(' ') || data.error, 'error'); }
  }

  async function handleInviteStudent(e) {
    e.preventDefault();
    const res  = await fetch('/api/groups/invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: myGroup.group_id, targetStudentId: inviteTarget }),
    });
    const data = await res.json();
    if (res.ok) { showToast(data.message); setInviteTarget(''); }
    else        { showToast(data.errors?.join(' ') || data.error, 'error'); }
  }

  async function handleRespondInvite(inviteId, action) {
    const res  = await fetch('/api/groups/respond-invite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId, action }),
    });
    const data = await res.json();
    if (res.ok) { showToast(action === 'accept' ? 'You joined the group!' : 'Invite declined.'); loadData(); }
    else        { showToast(data.errors?.join(' ') || data.error, 'error'); }
  }

  async function handleLock() {
    const res  = await fetch('/api/groups/lock', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: myGroup.group_id }),
    });
    const data = await res.json();
    if (res.ok) { showToast('Group locked and confirmed valid!'); loadData(); }
    else        { showToast(data.errors?.join(' ') || data.error, 'error'); }
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this group?')) return;
    const res = await fetch('/api/groups/leave', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: myGroup.group_id }),
    });
    if (res.ok) { showToast('You have left the group.'); setMyGroup(null); setMyMembers([]); loadData(); }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) return (
    <div style={{ background: '#0D1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E' }}>
      Loading...
    </div>
  );

  return (
    <>
      <Head><title>TeamUp — Dashboard</title></Head>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <nav>
        <div className="logo">Team<span>Up</span></div>
        <div className="nav-right">
          {student && (
            <span className="nav-name">
              {student.name}
              <span className={`badge ${student.isNew ? 'badge-amber' : 'badge-green'}`}>
                {student.isNew ? 'New Student' : 'Returning'}
              </span>
            </span>
          )}
          <button className="logout-btn" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div className="container">
        <h1 className="page-title">Dashboard</h1>

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="invites-banner">
            <div className="invites-title">📬 Pending Group Invites</div>
            {invites.map(inv => (
              <div key={inv.id} className="invite-row">
                <span><strong>{inv.from_name}</strong> has invited you to join <strong>{inv.group_name}</strong></span>
                <div className="invite-btns">
                  <button className="btn btn-teal btn-sm" onClick={() => handleRespondInvite(inv.id, 'accept')}>Accept</button>
                  <button className="btn btn-red  btn-sm" onClick={() => handleRespondInvite(inv.id, 'decline')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid">

          {/* My Tutorial Slots */}
          <div className="card">
            <div className="card-title teal">My Tutorial Slots</div>
            <div className="slot-list">
              {mySlots.length
                ? mySlots.map(s => <span key={s} className="slot">{s}</span>)
                : <span className="muted">No slots recorded</span>
              }
            </div>
          </div>

          {/* Constraint Status */}
          <div className="card">
            <div className="card-title amber">Constraint Status</div>
            {myGroup ? (
              <>
                <div className={`constraint-row ${sizeOk ? 'c-ok' : 'c-fail'}`}>
                  <span>{sizeOk ? '✅' : '❌'} Team size</span>
                  <span className="cv">{memberCount} / 4–5 members</span>
                </div>
                <div className={`constraint-row ${newOk ? 'c-ok' : 'c-fail'}`}>
                  <span>{newOk ? '✅' : '❌'} New students</span>
                  <span className="cv">{newCount} / max 2</span>
                </div>
                <div className={`constraint-row ${slotOk ? 'c-ok' : 'c-fail'}`}>
                  <span>{slotOk ? '✅' : '❌'} Shared slot</span>
                  <span className="cv">{myGroup.shared_slot || 'Not found yet'}</span>
                </div>
                {myGroup.status === 'forming' && (
                  allOk
                    ? <div className="all-ok">🎉 All constraints met — ready to lock!</div>
                    : <div className="not-ok">Invite more members to meet all constraints.</div>
                )}
                {myGroup.status === 'locked' && (
                  <div className="all-ok">🔒 Group locked and confirmed valid.</div>
                )}
              </>
            ) : (
              <>
                <div className="constraint-row c-info"><span>👥 Team size</span><span className="cv">4–5 members</span></div>
                <div className="constraint-row c-info"><span>🎓 New students</span><span className="cv">Max 2 per group</span></div>
                <div className="constraint-row c-info"><span>🗓 Tutorial slot</span><span className="cv">1+ shared slot</span></div>
                <p className="muted" style={{marginTop:12,fontSize:13}}>Join or create a group to see live constraint checks.</p>
              </>
            )}
          </div>

          {/* My Group */}
          <div className="card full-width">
            <div className="card-title purple">My Group</div>

            {myGroup ? (
              <>
                <div className="group-header-row">
                  <div>
                    <div className="group-name">{myGroup.name}</div>
                    <div className="group-meta">
                      {myGroup.group_id} &nbsp;·&nbsp;
                      <span className={`badge ${myGroup.status === 'locked' ? 'badge-red' : 'badge-blue'}`}>
                        {myGroup.status}
                      </span>
                      &nbsp;·&nbsp; {myGroup.type === 'private' ? '🔒 Private' : '🌐 Public'}
                    </div>
                  </div>
                </div>

                {/* Members grid */}
                <div className="members-grid">
                  {myMembers.map(m => (
                    <div key={m.student_id} className="member-card">
                      <div className="avatar">{m.name[0]}</div>
                      <div className="member-info">
                        <div className="member-name">{m.name}</div>
                        <div className="member-id">{m.student_id}</div>
                      </div>
                      <span className={`badge ${m.is_new ? 'badge-amber' : 'badge-green'}`}>
                        {m.is_new ? 'New' : 'Returning'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Invite by student ID (creator only, still forming) */}
                {isCreator && myGroup.status === 'forming' && (
                  <div className="invite-section">
                    <div className="section-label">Invite a student to this group</div>
                    <p style={{fontSize:13,color:'#8B949E',marginBottom:10}}>
                      Enter their student ID — they will receive a notification to accept or decline.
                    </p>
                    <form onSubmit={handleInviteStudent} className="inline-form">
                      <input
                        className="text-input"
                        placeholder="Student ID e.g. n10000003"
                        value={inviteTarget}
                        onChange={e => setInviteTarget(e.target.value)}
                        required
                      />
                      <button className="btn btn-blue" type="submit">Send Invite</button>
                    </form>
                  </div>
                )}

                {myGroup.status === 'forming' && (
                  <div className="btn-row">
                    {isCreator && allOk && (
                      <button className="btn btn-teal" onClick={handleLock}>🔒 Lock group</button>
                    )}
                    <button className="btn btn-red" onClick={handleLeave}>Leave group</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="muted" style={{ marginBottom: 20 }}>
                  You are not in a group yet. Create a group and invite your teammates, or browse public groups below.
                </p>

                <div className="section-label">Create a new group</div>
                <form onSubmit={handleCreate} className="inline-form" style={{ marginBottom: 8 }}>
                  <select className="select-input" value={groupType} onChange={e => setGroupType(e.target.value)}>
                    <option value="public">Public — anyone can request to join</option>
                    <option value="private">Private — invite only</option>
                  </select>
                  <button className="btn btn-blue" type="submit">Create group</button>
                </form>
                <p style={{fontSize:12,color:'#8B949E',marginBottom:4}}>
                  Once created, invite teammates by their student ID from your group panel.
                </p>
              </>
            )}
          </div>

          {/* Public Groups */}
          {!myGroup && (
            <div className="card full-width">
              <div className="card-title blue">Available Public Groups</div>
              {publicGroups.length === 0 ? (
                <p className="muted">No public groups available yet. Create one above.</p>
              ) : (
                publicGroups.map(g => (
                  <div key={g.group_id} className="public-group">
                    <div>
                      <div className="pg-name">{g.name}</div>
                      <div className="pg-meta">
                        <span className="pg-id">{g.group_id}</span>
                        <span className={g.member_count >= 4 ? 'warn' : 'ok'}>👥 {g.member_count}/5 members</span>
                        <span className={g.new_count >= 2 ? 'warn' : 'ok'}>🎓 {g.new_count}/2 new</span>
                        {g.shared_slot && <span className="slot">{g.shared_slot}</span>}
                      </div>
                    </div>
                    <button className="btn btn-blue btn-sm" onClick={() => handleJoin(g.group_id)}>Join</button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :global(body) { font-family: -apple-system, sans-serif; background: #0D1117; color: #E6EDF3; }

        .toast { position: fixed; top: 20px; right: 20px; z-index: 999; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; max-width: 380px; }
        .toast-success { background: rgba(63,185,80,.15); border: 1px solid rgba(63,185,80,.4); color: #3FB950; }
        .toast-error   { background: rgba(248,81,73,.15); border: 1px solid rgba(248,81,73,.4); color: #F85149; }

        nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid #30363D; background: #161B22; }
        .logo { font-size: 22px; font-weight: 700; color: #E6EDF3; }
        .logo span { color: #00C9A7; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .nav-name { font-size: 14px; color: #8B949E; display: flex; align-items: center; gap: 8px; }
        .logout-btn { background: none; border: 1px solid #30363D; color: #8B949E; padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all .15s; }
        .logout-btn:hover { color: #E6EDF3; border-color: #8B949E; }

        .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
        .page-title { font-size: 26px; font-weight: 700; margin-bottom: 24px; letter-spacing: -.5px; }

        .invites-banner { background: rgba(29,111,232,.08); border: 1px solid rgba(29,111,232,.25); border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
        .invites-title  { font-size: 13px; font-weight: 600; color: #1D6FE8; margin-bottom: 12px; }
        .invite-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(29,111,232,.12); font-size: 14px; gap: 12px; flex-wrap: wrap; }
        .invite-row:last-child { border: none; padding-bottom: 0; }
        .invite-btns { display: flex; gap: 8px; flex-shrink: 0; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .full-width { grid-column: 1 / -1; }
        @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }

        .card { background: #161B22; border: 1px solid #30363D; border-radius: 12px; padding: 22px; }
        .card-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .card-title::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        .teal { color: #00C9A7; } .purple { color: #7F77DD; } .blue { color: #1D6FE8; } .amber { color: #E3A008; }

        .slot-list { display: flex; flex-wrap: wrap; gap: 6px; }
        .slot { background: #1C2128; border: 1px solid #30363D; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-family: monospace; color: #00C9A7; }
        .muted { font-size: 14px; color: #8B949E; line-height: 1.6; }

        .constraint-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px; font-size: 14px; }
        .cv { font-family: monospace; font-size: 13px; }
        .c-ok   { background: rgba(63,185,80,.08);  color: #3FB950; }
        .c-fail { background: rgba(248,81,73,.08);  color: #F85149; }
        .c-info { background: #1C2128; color: #8B949E; }
        .all-ok { background: rgba(63,185,80,.1);  border: 1px solid rgba(63,185,80,.3);  color: #3FB950; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-top: 10px; text-align: center; }
        .not-ok { background: rgba(248,81,73,.06); border: 1px solid rgba(248,81,73,.2);  color: #F85149; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-top: 10px; text-align: center; }

        .group-header-row { margin-bottom: 20px; }
        .group-name { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
        .group-meta { font-size: 12px; color: #8B949E; }

        .members-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        @media (max-width: 600px) { .members-grid { grid-template-columns: 1fr; } }
        .member-card { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #1C2128; border-radius: 8px; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: #1D6FE8; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: white; flex-shrink: 0; }
        .member-info { flex: 1; min-width: 0; }
        .member-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .member-id { font-size: 11px; color: #8B949E; font-family: monospace; }

        .invite-section { background: rgba(29,111,232,.05); border: 1px solid rgba(29,111,232,.15); border-radius: 10px; padding: 16px; margin-bottom: 16px; }
        .section-label { font-size: 12px; color: #8B949E; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 6px; }
        .inline-form { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-row { display: flex; gap: 8px; flex-wrap: wrap; }

        .btn { padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .15s; }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-blue { background: #1D6FE8; color: white; } .btn-blue:hover { background: #1353B0; }
        .btn-teal { background: rgba(0,201,167,.15); color: #00C9A7; border: 1px solid rgba(0,201,167,.3); } .btn-teal:hover { background: rgba(0,201,167,.25); }
        .btn-red  { background: rgba(248,81,73,.12); color: #F85149; border: 1px solid rgba(248,81,73,.3); } .btn-red:hover { background: rgba(248,81,73,.22); }

        .text-input, .select-input { flex: 1; min-width: 160px; background: #1C2128; border: 1px solid #30363D; border-radius: 8px; padding: 10px 12px; font-size: 14px; color: #E6EDF3; outline: none; transition: border-color .15s; }
        .text-input:focus, .select-input:focus { border-color: #1D6FE8; }
        .select-input option { background: #1C2128; }

        .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-blue  { background: rgba(29,111,232,.15); color: #1D6FE8; border: 1px solid rgba(29,111,232,.3); }
        .badge-red   { background: rgba(248,81,73,.15);  color: #F85149; border: 1px solid rgba(248,81,73,.3); }
        .badge-amber { background: rgba(227,160,8,.15);  color: #E3A008; border: 1px solid rgba(227,160,8,.3); }
        .badge-green { background: rgba(63,185,80,.12);  color: #3FB950; border: 1px solid rgba(63,185,80,.25); }

        .public-group { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #1C2128; border: 1px solid #30363D; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
        .pg-name { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
        .pg-meta { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; color: #8B949E; align-items: center; }
        .pg-id { font-family: monospace; }
        .warn { color: #E3A008; } .ok { color: #3FB950; }
      `}</style>
    </>
  );
}
