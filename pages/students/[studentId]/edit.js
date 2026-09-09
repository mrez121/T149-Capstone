// pages/students/[studentId]/edit
// Edit student profile and availability page

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function EditProfilePage() {
    
    const router = useRouter();
    const {studentId} = router.query;

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        teamupId: '',
        preferred_name: '',
        remote_student:'',
        skills: '',
        interests: '',
        bio: '',
        contact_method: '',
        contact_handle: '',
    });
    // Availability slot states
    const [slots, setSlots] = useState([]);
    const [unitSlots, setUnitSlots] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    //Functionality here
    useEffect(() => {
        if(!router.isReady) {
            return;
        }

        async function loadStudentProfile() {
            try {
                // Fetches student data
                const res = await fetch('/api/students');
                // Gets all timeslots for the unit the student is enrolled in.
                const slotRes = await fetch(`/api/students/${studentId}`, {method: 'GET'});

                if(res.status === 401) {
                    router.push('/');
                    return;
                }
                if(slotRes.status === 401) {
                    router.push('/');
                    return
                }
                
                const data = await res.json();
                const unitSlotData = await slotRes.json();

                if(!res.ok) {
                    throw new Error(data.error || 'Unable to load student profile.');
                }

                setCurrentStudent(data.student || null);
                
                const routeTeamupId = Array.isArray(studentId)
                    ? studentId[0]
                    : studentId;
                
                
                const selectedStudent = (data.students || []).find(
                    (item) =>
                        item.teamupId.toLowerCase() === routeTeamupId.toLowerCase()
                );
                if(!selectedStudent) {
                    setError('Student profile not found.');
                }
                if(data.student.studentId !== selectedStudent.studentId) {
                    setError(`Cannot edit another student's profile.`);
                }
                else {
                    setProfile(selectedStudent);
                    setProfileForm({
                        teamupId: selectedStudent.teamupId,
                        preferred_name: selectedStudent.profile.preferredName,
                        remote_student: selectedStudent.profile.remoteStudent,
                        skills: selectedStudent.profile.skills,
                        interests: selectedStudent.profile.interests,
                        bio: selectedStudent.profile.bio,
                        contact_method: selectedStudent.profile.contactMethod,
                        contact_handle: selectedStudent.profile.contactHandle
                    });
                    setSlots(selectedStudent.slots);
                    console.log(selectedStudent);
                    console.log(selectedStudent.slots);
                }
            }
            catch(err) {
                setError(err.message || 'Unable to load student profile.');
            }
            finally {
                setLoading(false);
            }
        }

        loadStudentProfile();
    }, [router.isReady, studentId]);

    async function handleLogout() {
        await fetch('/api/auth/logout', {method: 'POST'});
        router.push('/');
    }

    function handleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setProfileForm(values => ({...values, [name]: value}));
    }

    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4000);
    }

    async function handleProfileSubmit(e) {
        e.preventDefault();
        setError('');

        setSaving(true);

        try {
            const res = await fetch(`/api/students/${studentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    submitType: 'profile',
                    preferred_name: profileForm.preferred_name,
                    remote_student: profileForm.remote_student,
                    skills: profileForm.skills,
                    interests: profileForm.interests,
                    bio: profileForm.bio,
                    contact_method: profileForm.contact_method,
                    contact_handle: profileForm.contact_handle
                }),
            });
            const data = await res.json();
            if(res.ok) {
                showToast('Profile details updated successfully.');
            }
            else {
                setError(data.error || 'Failed to update profile details.');
            }
        } catch {
            setError('Unable to save profile changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleAvailabilitySubmit(e) {
        e.preventDefault();
        setError('');

        setSaving(true);

        try {
            const res = await fetch(`/api/students/${studentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    submitType: 'availability',
                }),
            });
            const data = await res.json();
            if(res.ok) {
                showToast('Availability details updated successfully.');
            }
            else {
                setError(data.error || 'Failed to update availability details.');
            }
        } catch {
            setError('Unable to save availability changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }


    //HTML construction here
    if(loading) return(
        <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
            Loading...
        </div>
    );


    if(error || !profile) {
        return(
            <>
                <Head>
                    <title>TeamUp - Edit Student Profile</title>
                </Head>

                <main className='container'>
                    <section className='card directory-empty-state'>
                        <h1 className='page-title'>Student Profile</h1>
                        <p className='muted'>{error}</p>

                        <button
                            type='button'
                            className='btn btn-blue'
                            onClick={() => router.push('/students')}
                        >
                            Back to Student Directory
                        </button>
                    </section>
                </main>
            </>
        );
    }

    return(
        <>
            <Head>
                <title>TeamUp - Edit {profile.name}</title>
            </Head>

            <nav>
                <div className='logo'>
                    Team<span>Up</span>
                </div>
                <div className='nav-right'>
                    {currentStudent && (
                        <span className='nav-name'>
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
                        type='button'
                        className='directory-nav-link'
                        onClick={() => router.push('/students')}
                    >
                        Student Directory
                    </button>

                    <button
                        type='button'
                        className='directory-nav-link'
                        onClick={() => router.push('/dashboard')}
                    >
                        Dashboard
                    </button>

                    <button
                        type='button'
                        className='logout-btn'
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            <div className='container'>
                <h1 className='page-title'>Edit Profile</h1>
                <p className='page-subtitle'>Update your profile and availability</p>

                <form onSubmit={handleProfileSubmit} className='card'>
                    {error && <div className='aerror-box'>{error}</div>}

                    <div className='card-title'>Your profile</div>

                    <div className='card-divider'>
                        <label className='section-label'>TeamUp ID</label>
                        <input className='text-input' name='teamup_id' value={profileForm.teamupId} disabled style={{opacity:.5, cursor:'not-allowed'}} />
                        <span className='form-help'>TeamUp ID cannot be changed</span>
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Preferred Name</label>
                        <input className='text-input' name='preffered_name' value={profileForm.preferred_name} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Are you a remote student?</label>
                        <input type='checkbox' name='remote_student' checked={profileForm.remote_student} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Skills</label>
                        <input className='text-input' name='skills' value={profileForm.skills} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Interests</label>
                        <input className='text-input' name='interests' value={profileForm.interests} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Bio</label>
                        <input className='text-input' name='bio' value={profileForm.bio} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Contact Method</label>
                        <input className='text-input' name='contact_method' value={profileForm.contact_method} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Contact Handle</label>
                        <input className='text-input' name='contact_handle' value={profileForm.contact_handle} onChange={handleChange} />
                    </div>

                    <div className='btn-row'>
                        <button className='btn btn-blue' type='submit'disabled={saving}>
                            {saving ? 'Saving...' : 'Save profile'}
                        </button>
                        <Link href={`/students/${studentId}`} className='btn btn-ghost'>Cancel</Link>
                    </div>
                </form>
                
                <form onSubmit={handleAvailabilitySubmit} className='card'>
                    <div className='btn-row'>
                        <button className='btn btn-red' type='submit' disabled={saving}>
                            {saving ? 'Saving...' : 'Save availability'}
                        </button>
                    </div>
                </form>
                
            </div>
        </>
    )
    
}