// pages/students/[studentId].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function StudentProfile() {
  const router = useRouter();
  const { studentId } = router.query;

  const [currentStudent, setCurrentStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    // Fetches all students and selects the profile matching the URL.
    async function loadStudentProfile() {
      try {
        const res = await fetch('/api/students');

        if (res.status === 401) {
          router.push('/');
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load student profile.');
        }

        setCurrentStudent(data.student || null);

        const routeStudentId = Array.isArray(studentId)
          ? studentId[0]
          : studentId;

        // Finds the student whose ID matches the dynamic route parameter.
        const selectedStudent = (data.students || []).find(
          (item) =>
            item.studentId.toLowerCase() ===
            routeStudentId.toLowerCase()
        );

        if (!selectedStudent) {
          setError('Student profile not found.');
        } else {
          setProfile(selectedStudent);
        }
      } catch (err) {
        setError(err.message || 'Unable to load student profile.');
      } finally {
        setLoading(false);
      }
    }

    loadStudentProfile();
  }, [router.isReady, studentId]);

  // Ends the current session and returns the user to the login page.
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  // Converts database values such as "forming" into readable labels.
  function formatLabel(value) {
    if (!value) return 'Not provided';

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        Loading student profile...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Head>
          <title>TeamUp — Student Profile</title>
        </Head>

        <main className="container">
          <section className="card directory-empty-state">
            <h1 className="page-title">Student Profile</h1>
            <p className="muted">{error}</p>

            <button
              type="button"
              className="btn btn-blue"
              onClick={() => router.push('/students')}
            >
              Back to Student Directory
            </button>
          </section>
        </main>
      </>
    );
  }

  const isOwnProfile =
    currentStudent?.studentId === profile.studentId;

  return (
    <>
      <Head>
        <title>TeamUp — {profile.name}</title>
      </Head>

      <nav>
        <div className="logo">
          Team<span>Up</span>
        </div>

        <div className="nav-right">
          {currentStudent && (
            <span className="nav-name">
              {currentStudent.name}

              <span
                className={`badge ${
                  currentStudent.isNew
                    ? 'badge-amber'
                    : 'badge-green'
                }`}
              >
                {currentStudent.isNew
                  ? 'New Student'
                  : 'Returning'}
              </span>
            </span>
          )}

          <button
            type="button"
            className="directory-nav-link"
            onClick={() => router.push('/students')}
          >
            Student Directory
          </button>

          <button
            type="button"
            className="directory-nav-link"
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </button>

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="container directory-page profile-page">
        <section className="directory-hero">
          <div>
            <h1 className="page-title">Student Profile</h1>

            <p className="page-subtitle">
              View student information, tutorial availability and
              current group status.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-blue"
            onClick={() => router.push('/students')}
          >
            Back to Directory
          </button>
        </section>

        <section className="card profile-overview-card">
          <div className="directory-student-top">
            <div className="directory-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="directory-student-main">
              <div className="directory-name-row">
                <h2>{profile.name}</h2>

                {isOwnProfile && (
                  <span className="badge badge-blue">You</span>
                )}
              </div>

              <p>{profile.studentId}</p>
            </div>

            <span
              className={`badge ${
                profile.isNew
                  ? 'badge-amber'
                  : 'badge-green'
              }`}
            >
              {profile.isNew ? 'New Student' : 'Returning'}
            </span>
          </div>

          <div className="directory-detail-list profile-detail-list">
            <div>
              <span>Student ID</span>
              <strong>{profile.studentId}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>

            <div>
              <span>Cohort</span>
              <strong>{profile.cohort || 'Not provided'}</strong>
            </div>

            <div>
              <span>Group status</span>
              <strong>
                {profile.group
                  ? profile.group.name
                  : 'Available'}
              </strong>
            </div>
          </div>
        </section>

        <div className="grid profile-grid">
          <section className="card">
            <div className="card-title teal">
              Tutorial Availability
            </div>

            {profile.slots.length > 0 ? (
              <div className="slot-list">
                {profile.slots.map((slot) => (
                  <span key={slot} className="slot">
                    {slot}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">
                No tutorial availability has been added.
              </p>
            )}
          </section>

          <section className="card">
            <div className="card-title purple">
              Current Group
            </div>

            {profile.group ? (
              <div className="directory-detail-list">
                <div>
                  <span>Group name</span>
                  <strong>{profile.group.name}</strong>
                </div>

                <div>
                  <span>Group ID</span>
                  <strong>{profile.group.groupId}</strong>
                </div>

                <div>
                  <span>Group type</span>
                  <strong>
                    {formatLabel(profile.group.type)}
                  </strong>
                </div>

                <div>
                  <span>Group status</span>
                  <strong>
                    {formatLabel(profile.group.status)}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="muted">
                This student is not currently in a group.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}