// pages/students/[studentId].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * @function StudentProfile
 * Constructs the Student Profile page using react.js
 * @returns Student Profile HTML (if loading state = false & no errors) || Loading HTML (if loading state = true) || Error html (if errors or no profile)
 */
export default function StudentProfile() {
  /**
   * @const router
   * @const studentId
   * @const currentStudent
   * @const profile
   * @const loading
   * @const error
   */
  const router = useRouter();
  const { studentId } = router.query;

  const [currentStudent, setCurrentStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    /**
     * @function loadStudentProfile
     * Fetches all students and selects the profile matching the URL.
     * If unable to find or load a student's profile, throw an error.
     * @returns router.push to login if user is not a student
     */
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

        const routeTeamupId = Array.isArray(studentId)
          ? studentId[0]
          : studentId;

        // Finds the student whose ID matches the dynamic route parameter.
        const selectedStudent = (data.students || []).find(
          (item) =>
            item.teamupId.toLowerCase() ===
            routeTeamupId.toLowerCase()
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

  /**
   * @function handleLogout
   * @async
   * Ends the current session and returns the user to the login page
   */
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  // Converts database values such as "forming" into readable labels.
  /**
   * @function formatLabel
   * Converts database values such as "forming" into readable labels
   * @param {*} value - a database value
   * @returns Formatted value || 'Not provided'
   */
  function formatLabel(value) {
    if (!value) return 'Not provided';

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatRemoteStatus(value) {
    if(value === 0) {
      return "On campus";
    }
    if(value === 1) {
      return "Remote student";
    }
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
              {currentStudent.name} - {currentStudent.teamupId}

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
          
          {isOwnProfile ? (
          <button
            type='button'
            className='btn btn-blue'
            onClick={() => router.push(`${profile.teamupId}/edit`)}
            >
              Edit Profile
            </button>
          ) : (
            null
          )}
          
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
              {profile.profile
              ? profile.profile.prefferedName.charAt(0).toUpperCase() 
              : profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="directory-student-main">
              <div className="directory-name-row">
                <h2>
                  {profile.profile
                  ? profile.profile.prefferedName
                  : profile.name}
                  </h2>

                {isOwnProfile && (
                  <span className="badge badge-blue">You</span>
                )}
              </div>

              <p>{profile.teamupId}</p>
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
              <span>TeamUp ID</span>
              <strong>{profile.teamupId}</strong>
            </div>

            <div>
              <span>Remote Student</span>
              <strong>
                {profile.profile
                ? formatRemoteStatus(profile.profile.remoteStudent)
                : "Not specified"
                }
              </strong>
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

            <div>
              <span>Bio</span>
              <strong>
                {profile.profile
                ? profile.profile.bio
                : ''
                }
              </strong>
            </div>

            <div>
              <span>Skills</span>
              <strong>
                {profile.profile
                ? profile.profile.skills
                : ''
                }
                </strong>
            </div>
            
            <div>
              <span>Interests</span>
              <strong>
                {profile.profile
                ? profile.profile.interests
                : ''
                }
              </strong>
            </div>

            <div>
              <span>Contact method</span>
              <strong>
                {profile.profile
                ? profile.profile.contactMethod + ": " + profile.profile.contactHandle
                : ''
                }
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