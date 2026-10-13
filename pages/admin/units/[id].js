// pages/admin/units/[id].js
// Edit an existing unit's details and constraints

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import Head                    from 'next/head';
import Link                    from 'next/link';
import AdminToast from '../../../components/AdminToast';

/**
 * @function EditUnitPage
 * Builds TeamUp's edit unit page using react.js
 * @returns Edit unit page HTML (if loading state = false) || loading HTML (if loading state= true)
 */
export default function EditUnitPage() {
  /**
   * @const router
   * @const id
   * @const form
   * @const loading
   * @const saving
   * @const error
   * @const toast
   */
  const router = useRouter();
  const { id } = router.query;

  // Form state
  const [form, setForm] = useState({
    unit_code: '',
    unit_name: '',
    semester:  '',
    min_size:  4,
    max_size:  5,
    max_new:   2,
  });
  const [unitCode, setUnitCode] = useState('');
  const [unitSlots, setUnitSlots] = useState([]);
  const [timeslotInput, setTimeslotInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null);

  const validDays = ["MON", "TUE", "WED", "THU", "FRI"];

  // Load existing unit data when page loads
  useEffect(() => {
    if (!id) return;

    async function loadUnitData() {
      try {
        const res = await fetch(`/api/admin/units/${id}`, {method: 'GET'});
          if(res.status === 403) {
            router.push('/');
          }
        const data = await res.json();
        if(!res.ok) {
          throw new Error(data.error || "Unable to load unit details.");
        }
        setForm({
          unit_code: data.unit.unit_code,
          unit_name: data.unit.unit_name,
          semester:  data.unit.semester,
          min_size:  data.unit.min_size ?? 4,
          max_size:  data.unit.max_size ?? 5,
          max_new:   data.unit.max_new  ?? 2,
        });
        setUnitCode(data.unit.unit_code);
        setUnitSlots(data.timeslots);
      } catch (error) {
        setError(error.message || "Unable to load unit details.");
        router.push('/admin/units');
      } finally {
        setLoading(false);
      }
    }
    loadUnitData();
  }, [id]);

  /**
   * @function handleChange
   * Update form state when input changes
   * @param {*} e react event
   */
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  /**
   * @function showToast
   * Show a temporary notification message
   * @param {*} msg 
   * @param {*} type 
   */
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  /**
   * @function handleSubmit
   * @async
   * Validate the group size range before submitting the updated unit to the API.
   * Preserve form values on failure and always restore the save button after a request.
   * @param {*} e react event
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (Number(form.min_size) > Number(form.max_size)) {
      setError('Min group size cannot be greater than max group size.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/units/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          submitType: 'details',
          unit_name: form.unit_name,
          semester:  form.semester,
          min_size:  Number(form.min_size),
          max_size:  Number(form.max_size),
          max_new:   Number(form.max_new),
        }),
      });
      const data = await res.json();

      if (res.ok) { showToast('Unit updated successfully.'); }
      else        { setError(data.error || 'Failed to update unit.'); }
    } catch {
      setError('Unable to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  /**
   * @function handleTimeslotInput
   * This function updates the timeslot input field.
   * @param {*} e a react event
   */
  const handleTimeslotInput = (e) => {
    setTimeslotInput((timeslotInput) => {
      return e.target.value;
    });
  }

  /**
   * @function formatTimeslot
   * This function formats the timeslot input field after adding the timeslot
   * to the state array (called in addSlot function)
   * @param {string} timeslot the timeslot to be formatted
   */
  function formatTimeslot(timeslot) {
    // Split input into parts and use regex to split by - : and space
    const parts = timeslot.trim().toLowerCase().split(/[-\s:]/);
    // Check if timeslot input has at least 2 parts (day and hour at minimum)
    if(parts.length < 2) {
      return null;
    }
    // If only day and hour, add 00 as minutes to keep formatting consistent
    else if(parts.length < 3) {
      parts.push('00');
    }
    const [day, hour, min] = parts;
    // Take first 3 characters of day string and format to uppercase
    const formattedDay = day.substring(0, 3).toUpperCase();
    const dayMatch = validDays.includes(formattedDay);
    if(!dayMatch) {
      return null;
    }
    // Parse the hour as a number, check if it's valid in 24 hour format, then store as a string
    const hourNum = parseInt(hour, 10);
    if(isNaN(hourNum) || hourNum < 0 || hourNum > 23) {
      return null;
    }
    const formattedHour = String(hourNum).padStart(2, '0');
    // Same process as the hour for minutes
    const minNum = parseInt(min, 10);
    if(isNaN(minNum) || minNum < 0 || minNum > 59) {
      return null;
    }
    const formattedMin = String(minNum).padStart(2, '0');
    // Return the timeslot as DAY-HH:MM
    return `${formattedDay}-${formattedHour}:${formattedMin}`;
  }

  /**
   * @function addSlot
   * Adds a new timeslot to the unit
   */
  function addSlot() {
    const timeslot = timeslotInput.toUpperCase();
    const lastSlot = unitSlots.at(-1);
    const formattedSlot = formatTimeslot(timeslot);
    if(formattedSlot === null) {
      showToast("Invalid timeslot input. Please use format DAY-HH:MM", 'error');
      return;
    }
    const duplicateSlot = unitSlots.some(slot => slot.slot === formattedSlot);
    if(duplicateSlot) {
      showToast('Unable to add duplicate timeslot to unit.', 'error');
      return;
    }
    else if(formattedSlot !== ''){
      if(lastSlot === undefined) {
        setUnitSlots(unitSlots => [...unitSlots, {id: 0, slot: formattedSlot}]);
        return;
      }
      else {
        setUnitSlots(unitSlots => [...unitSlots, {id: (lastSlot.id + 1), slot: formattedSlot}]);
        return;
      }
    }
  }

  /**
   * @function removeSlot
   * Removes a timeslot from the unit
   * @param {*} e A react event
   */
  function removeSlot(e) {
    const value = e.target.value;

    if(unitSlots.filter(slot => slot.slot === value).length > 0) {
      
      setUnitSlots(unitSlots.filter(slot => slot.slot !== value));     
            
      showToast('Timeslot removed. Save changes before leaving page.')
    }
  }

  /**
   * @function handleAvailabilitySub
   * @async
   * Submits the timeslot form to the api.
   * @param {*} e A react event
   */
  async function handleAvailabilitySub(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/units/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          submitType: 'timeslot',
          timeslots: unitSlots
        }),
      });
      const data = await res.json();
      if(res.ok) {
        showToast(`${unitCode} timeslots updated successfully.`);
      }
      else {
        setError(data.error || 'Failed to update unit timeslots.');
      }
    } catch {
      setError('Unable to save timeslot changes. Please try again.');
    } finally {
      setSaving(false);
    }

  }

  if (loading) return (
    <div style={{ background:'#0D1117', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#8B949E' }}>
      Loading...
    </div>
  );

  return (
    <>
      <Head><title>TeamUp — Edit Unit</title></Head>
      <AdminToast toast={toast} />

      <nav className="anav">
        <div className="anav-logo">Team<span>Up</span> <span className="admin-tag">Admin</span></div>
        <Link href="/admin/units" className="anav-link anav-button">← Back to units</Link>
      </nav>

      <div className="acontainer-sm">
        <h1 className="apage-title">Edit Unit</h1>
        <p className="apage-sub">Update unit details and group formation constraints</p>

        <form onSubmit={handleSubmit} className="aform-card">
          {error && <div className="aerror-box">{error}</div>}

          <div className="asection-label">Unit Details</div>

          {/* Unit code is read only */}
          <div className="afield">
            <label>Unit Code</label>
            <input name="unit_code" value={form.unit_code} disabled style={{opacity:.5, cursor:'not-allowed'}} />
            <span className="ahint">Unit code cannot be changed after creation</span>
          </div>

          <div className="afield">
            <label>Unit Name</label>
            <input name="unit_name" value={form.unit_name} onChange={handleChange} required />
          </div>

          <div className="afield">
            <label>Semester</label>
            <input name="semester" value={form.semester} onChange={handleChange} required />
          </div>

          <div className="adivider" />

          <div className="asection-label">Group Formation Constraints</div>
          <p className="asection-desc">Changes apply to new groups only — existing groups are not affected.</p>

          <div className="afields-row">
            <div className="afield">
              <label>Min group size</label>
              <input type="number" name="min_size" value={form.min_size} onChange={handleChange} min={2} max={10} required />
            </div>
            <div className="afield">
              <label>Max group size</label>
              <input type="number" name="max_size" value={form.max_size} onChange={handleChange} min={2} max={10} required />
            </div>
            <div className="afield">
              <label>Max new students</label>
              <input type="number" name="max_new" value={form.max_new} onChange={handleChange} min={0} max={10} required />
            </div>
          </div>

          <div className="aconstraints-preview">
            <div className="apreview-label">Current constraints</div>
            <div className="apreview-tags">
              <span className="aconstraint-tag">👥 {form.min_size}–{form.max_size} members per group</span>
              <span className="aconstraint-tag">🎓 Max {form.max_new} new students per group</span>
              <span className="aconstraint-tag">🗓 1+ shared tutorial slot required</span>
            </div>
          </div>

          <div className="abtn-row">
            <button className="abtn abtn-blue" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <Link href="/admin/units" className="abtn abtn-ghost">Cancel</Link>
          </div>
        </form>
      </div>

      <div className='acontainer-sm'>
        <form onSubmit={handleAvailabilitySub} className="aform-card">
        
        
          <div className='adivider'/>
            <div className='asection-label'>Unit tutorial timeslots</div>
            <div className='aconstraints-preview'>
              <div className='apreview-label'>Current tutorial timeslots</div>
              <ul>
                {unitSlots.map((item) => {
                  return (
                    <button
                      key={item.id}
                      type='button'
                      className='btn btn-red'
                      value={item.slot}
                      onClick={removeSlot}
                    >
                      {item.slot}
                    </button>
                  )
                })}
              </ul>
            </div>

            <div className='afield'>
              <label>Add timeslot</label>
              <input name='timeslot' value={timeslotInput} onChange={handleTimeslotInput} placeholder='e.g., MON-09:00'/>
              <button className='abtn abtn-teal' type='button' onClick={() => addSlot()}>Add timeslot</button>
            </div>
            
          <div className="abtn-row">
            <button className="abtn abtn-blue" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <Link href="/admin/units" className="abtn abtn-ghost">Cancel</Link>
          </div>
        </form>
      </div>

      <style jsx>{`
        .anav { display:flex; align-items:center; justify-content:space-between; padding:16px 32px; border-bottom:1px solid #30363D; background:#161B22; }
        .anav-logo { font-size:20px; font-weight:700; color:#E6EDF3; display:flex; align-items:center; gap:10px; }
        .anav-logo span { color:#00C9A7; }
        .admin-tag { background:rgba(227,160,8,.15); color:#E3A008; border:1px solid rgba(227,160,8,.3); border-radius:6px; padding:2px 8px; font-size:12px; font-weight:600; }
        .anav-link { color:#8B949E; text-decoration:none; font-size:14px; }
        .anav-link:hover { color:#E6EDF3; }
        .acontainer-sm { max-width:680px; margin:0 auto; padding:32px 24px; }
        .apage-title { font-size:26px; font-weight:700; margin-bottom:4px; color:#E6EDF3; }
        .apage-sub { font-size:14px; color:#8B949E; margin-bottom:28px; }
        .aform-card { background:#161B22; border:1px solid #30363D; border-radius:12px; padding:28px; }
        .aerror-box { background:rgba(248,81,73,.12); border:1px solid rgba(248,81,73,.3); border-radius:8px; padding:12px 14px; font-size:14px; color:#F85149; margin-bottom:20px; }
        .asection-label { font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:#8B949E; margin-bottom:16px; }
        .asection-desc { font-size:13px; color:#8B949E; margin-top:-10px; margin-bottom:16px; }
        .afield { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; }
        .afield label { font-size:13px; font-weight:500; color:#C9D1D9; }
        .afield input { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:10px 12px; font-size:14px; color:#E6EDF3; outline:none; transition:border-color .15s; }
        .afield input:focus { border-color:#1D6FE8; }
        .ahint { font-size:12px; color:#8B949E; }
        .afields-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        .adivider { border:none; border-top:1px solid #30363D; margin:24px 0; }
        .aconstraints-preview { background:#0D1117; border:1px solid #30363D; border-radius:8px; padding:14px 16px; margin-bottom:24px; }
        .apreview-label { font-size:12px; color:#8B949E; margin-bottom:10px; }
        .apreview-tags { display:flex; gap:8px; flex-wrap:wrap; }
        .aconstraint-tag { background:rgba(0,201,167,.1); border:1px solid rgba(0,201,167,.25); color:#00C9A7; border-radius:6px; padding:4px 10px; font-size:12px; }
        .abtn-row { display:flex; gap:12px; align-items:center; }
      `}</style>
    </>
  );
}
