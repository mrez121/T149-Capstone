// pages/students/[studentId]/edit
// Edit student profile and availability page

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

/**
 * @function EditProfilePage
 * This function creates the Edit Profile page using react.js
 * @returns Edit Profile Page html || loading html (if loading = true) || error page html (if error with fetching or updating profile information)
 */
export default function EditProfilePage() {
    /**
     * Constatnts related to page data and states
     */
    const router = useRouter();
    const {studentId} = router.query;

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        teamupId: '',
        preferred_name: '',
        remote_student: false,
        skills: '',
        interests: '',
        bio: '',
        contact_method: '',
        contact_handle: '',
    });
    // Availability slot states
    const [studentSlots, setStudentSlots] = useState([]);
    const [unitSlots, setUnitSlots] = useState(null);

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

        /**
         * @function loadStudentProfile
         * @async
         * Load the student profile information for the student (if it exists already).
         * Prefill the edit forms with their profile and availability information.
         * Loading state defines page construction at the end of this function call, ensuring that updates are reflected to the user in real-time.
         * Follows similar structure to the student directory for fetching and displaying data.
         */
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
                setUnitSlots(unitSlotData);

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
                    // Set profile information and form details if the user already has a profile.
                    setProfile(selectedStudent);
                    const studentProfile = selectedStudent.profile;
                    if(studentProfile !== null) {
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
                    }
                    else {
                        setProfileForm({
                            teamupId: selectedStudent.teamupId
                        })
                    }
                    
                    setStudentSlots(selectedStudent.slots);
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

    /**
     * @function handleLogout
     * @async
     * End the session and return the user to the login page
     */
    async function handleLogout() {
        await fetch('/api/auth/logout', {method: 'POST'});
        router.push('/');
    }

    /**
     * @function handleChange
     * Updates the profile form state with the information that the user fills in.
     * @param {*} e a react event
     */
    function handleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        setProfileForm(values => ({...values, [name]: value}));
    }

    /**
     * @function showToast
     * A reusable feedback helper for actions on the page
     * @param {*} msg - a message to be displayed to the user
     * @param {*} type - determines the visual formatting of the toast displayed
     */
    function showToast(msg, type = 'success') {
        setToast({msg, type});
        setTimeout(() => setToast(null), 4000);
    }

    /**
     * @function handleProfileSubmit
     * @async
     * submits the information in the profile form to be entered into the database.
     * @param {*} e a react event
     */
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

    /**
     * @function handleSlotSelect
     * A function that adjusts what timeslots a student has selected for their availability.
     * @param {*} e a react event
     */
    function handleSlotSelect(e) {
        const value = e.target.value;
        const selectCheck = studentSlots.includes(value);
        
        if(!selectCheck) {
            setStudentSlots([...studentSlots, value]);            
        }
        if(selectCheck) {
            setStudentSlots(studentSlots.filter(slot => slot !== value));
        }
    }

    /**
     * @function handleAvailabilitySubmit
     * @async
     * submits the student's availability information to be entered into the database
     * @param {*} e a react event
     */
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
                    selectedSlots: studentSlots,
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

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.msg}
                </div>
            )}

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
                        <div className='form-help'>TeamUp ID cannot be changed</div>
                        <input className='text-input' name='teamup_id' value={profileForm.teamupId} disabled style={{opacity:.5, cursor:'not-allowed'}} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Preferred Name</label>
                        <div className='form-help'>Optional</div>
                        <input className='text-input' name='preferred_name' value={profileForm.preferred_name} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Are you a remote student?</label>
                        <span>{/*SPACING FOR TESTING */}      </span>
                        <input type='checkbox' name='remote_student' checked={profileForm.remote_student} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Skills</label>
                        <div className='form-help'>Optional</div>
                        <input className='text-input' name='skills' value={profileForm.skills} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Interests</label>
                        <div className='form-help'>Optional</div>
                        <input className='text-input' name='interests' value={profileForm.interests} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Bio</label>
                        <div className='form-help'>Optional</div>
                        <input className='text-input' name='bio' value={profileForm.bio} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Contact Method</label>
                        <div className='form-help'>E.g., phone, email, Discord, etc.</div>
                        <input className='text-input' name='contact_method' value={profileForm.contact_method} onChange={handleChange} />
                    </div>

                    <div className='card-divider'>
                        <label className='section-label'>Contact Handle</label>
                        <div className='form-help'>Only share contact info you are ok with being publically available</div>
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
                    {error && <div className='aerror-box'>{error}</div>}

                    <ul>
                        {unitSlots.timeslots.map((item) => {
                            const selectedSlot = studentSlots.includes(item.slot);
                            if(selectedSlot) {
                                return (
                                    <button
                                        key={item.id}
                                        type='button'
                                        className='btn btn-teal'
                                        value={item.slot}
                                        onClick={handleSlotSelect}
                                    >
                                    {item.slot}
                                </button>
                                )
                            }
                            if(!selectedSlot) {
                                return (
                                    <button
                                        key={item.id}
                                        type='button'
                                        className='btn btn-red'
                                        value={item.slot}
                                        onClick={handleSlotSelect}
                                    >
                                    {item.slot}
                                </button>
                                )
                            }
                            
                        })}
                    </ul>
                    <div className='btn-row'>
                        <button className='btn btn-blue' type='submit' disabled={saving}>
                            {saving ? 'Saving...' : 'Save availability'}
                        </button>
                    </div>
                </form>
                
            </div>
        </>
    )
    
}