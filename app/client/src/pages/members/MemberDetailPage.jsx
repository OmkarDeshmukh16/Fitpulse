import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  Calendar,
  User,
  Snowflake,
  MapPin,
  HeartPulse,
  Shield,
  CreditCard,
  Clock,
  Dumbbell,
  Utensils,
  Plus,
  Trash2,
  Save,
  Loader,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  useGetMemberQuery,
  useGetMemberAttendanceQuery,
  useGetMemberPaymentsQuery,
  useFreezeMembershipMutation,
  useUnfreezeMembershipMutation,
  useGetMemberWorkoutPlanQuery,
  useUpsertMemberWorkoutPlanMutation,
  useGetMemberDietPlanQuery,
  useUpsertMemberDietPlanMutation,
} from '../../services/members.api'

const statusBadge = (status) => {
  const map = { active: 'active', inactive: 'inactive', frozen: 'frozen', expired: 'expired' }
  return <span className={`badge badge-${map[status] || 'inactive'}`}>{status}</span>
}

export default function MemberDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')

  const { data: memberRes, isLoading, isError } = useGetMemberQuery(id)
  const { data: attendanceRes } = useGetMemberAttendanceQuery({ id })
  const { data: paymentsRes } = useGetMemberPaymentsQuery(id)

  const [freezeMembership] = useFreezeMembershipMutation()
  const [unfreezeMembership] = useUnfreezeMembershipMutation()

  const member = memberRes?.data || null
  const attendance = attendanceRes?.data || []
  const payments = paymentsRes?.data || []

  const handleFreezeToggle = async () => {
    if (!member) return
    try {
      if (member.membershipStatus === 'frozen') {
        await unfreezeMembership(id).unwrap()
        toast.success('Membership unfrozen')
      } else {
        await freezeMembership(id).unwrap()
        toast.success('Membership frozen')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed')
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading member profile...
      </div>
    )
  }

  if (isError || !member) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Member not found or error loading profile.</p>
        <button className="btn btn-secondary" onClick={() => navigate('/members')}>
          <ArrowLeft size={16} /> Back to Members
        </button>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/members')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 className="page-title">{member.fullName}</h1>
              {statusBadge(member.membershipStatus)}
            </div>
            <p className="page-subtitle">ID: <span style={{ fontFamily: 'monospace' }}>{member.memberId}</span></p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/members/${id}/edit`}>
            <button className="btn btn-secondary">
              <Edit size={16} /> Edit Profile
            </button>
          </Link>

          {member.membershipStatus === 'active' && (
            <button className="btn btn-secondary" style={{ color: 'var(--color-info)' }} onClick={handleFreezeToggle}>
              <Snowflake size={16} /> Freeze Membership
            </button>
          )}

          {member.membershipStatus === 'frozen' && (
            <button className="btn btn-secondary" style={{ color: 'var(--color-success)' }} onClick={handleFreezeToggle}>
              <Snowflake size={16} /> Unfreeze Membership
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('details')}
          style={{ fontSize: '0.85rem' }}
        >
          <User size={15} /> Overview & Details
        </button>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('attendance')}
          style={{ fontSize: '0.85rem' }}
        >
          <Clock size={15} /> Attendance History ({attendance.length})
        </button>
        <button
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('payments')}
          style={{ fontSize: '0.85rem' }}
        >
          <CreditCard size={15} /> Payment History ({payments.length})
        </button>
        <button
          className={`btn ${activeTab === 'workout' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('workout')}
          style={{ fontSize: '0.85rem' }}
        >
          <Dumbbell size={15} /> Workout Plan
        </button>
        <button
          className={`btn ${activeTab === 'diet' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('diet')}
          style={{ fontSize: '0.85rem' }}
        >
          <Utensils size={15} /> Diet Plan
        </button>
      </div>

      {/* Tab 1: Overview & Details */}
      {activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Member Card Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
              <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                {member.photo ? (
                  <img src={member.photo} alt={member.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  member.fullName?.charAt(0)
                )}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{member.fullName}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{member.email || 'No email provided'}</p>
              </div>

              {member.qrCode && (
                <div style={{ padding: '0.75rem', background: '#fff', borderRadius: '10px', marginTop: '0.5rem' }}>
                  <img src={member.qrCode} alt="Member QR Code" style={{ width: 120, height: 120 }} />
                </div>
              )}
            </div>

            {/* Current Plan Box */}
            <div className="card">
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="var(--color-accent)" /> Current Plan
              </h4>
              {member.currentPlanId ? (
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                    {member.currentPlanId.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Price: ₹{member.currentPlanId.price} | Duration: {member.currentPlanId.durationDays} days
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>No active plan assigned.</p>
              )}
            </div>
          </div>

          {/* Detailed Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Personal Details */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>
                Personal Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Phone</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <Phone size={14} color="var(--color-accent-light)" /> {member.phone || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Email</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <Mail size={14} color="var(--color-accent-light)" /> {member.email || '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Gender</span>
                  <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>{member.gender || '—'}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Date of Birth</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <Calendar size={14} color="var(--color-accent-light)" />
                    {member.dob ? format(new Date(member.dob), 'dd MMM yyyy') : '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Join Date</span>
                  <div style={{ fontWeight: 500 }}>
                    {member.joinDate ? format(new Date(member.joinDate), 'dd MMM yyyy') : '—'}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Blood Group</span>
                  <div style={{ fontWeight: 500, color: 'var(--color-danger)' }}>{member.bloodGroup || '—'}</div>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Address</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <MapPin size={14} color="var(--color-accent-light)" /> {member.address || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Medical & Notes */}
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HeartPulse size={16} color="var(--color-danger)" /> Medical & Health Notes
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Medical Conditions</span>
                  <div>{member.medicalConditions || 'None reported'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Additional Notes</span>
                  <div>{member.notes || 'None'}</div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {member.emergencyContact && (
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                  Emergency Contact
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Name</span>
                    <div style={{ fontWeight: 500 }}>{member.emergencyContact.name || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Phone</span>
                    <div style={{ fontWeight: 500 }}>{member.emergencyContact.phone || '—'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Relation</span>
                    <div style={{ fontWeight: 500 }}>{member.emergencyContact.relation || '—'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {attendance.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No attendance records logged for this member.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Check-in Time</th>
                    <th>Check-out Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec) => (
                    <tr key={rec._id}>
                      <td>{rec.checkInTime ? format(new Date(rec.checkInTime), 'dd MMM yyyy, hh:mm a') : '—'}</td>
                      <td>{rec.checkOutTime ? format(new Date(rec.checkOutTime), 'dd MMM yyyy, hh:mm a') : '—'}</td>
                      <td><span className="badge badge-active">{rec.status || 'Present'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payment History */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {payments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No payment transactions found for this member.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>{p.date ? format(new Date(p.date), 'dd MMM yyyy') : '—'}</td>
                      <td style={{ fontWeight: 600 }}>₹{p.amount?.toLocaleString()}</td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{p.paymentMethod}</td>
                      <td><span className={`badge badge-${p.status === 'completed' ? 'active' : 'inactive'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Workout Plan */}
      {activeTab === 'workout' && <WorkoutPlanTab memberId={id} />}

      {/* Tab 5: Diet Plan */}
      {activeTab === 'diet' && <DietPlanTab memberId={id} />}
    </div>
  )
}

function WorkoutPlanTab({ memberId }) {
  const { data: planRes, isLoading } = useGetMemberWorkoutPlanQuery(memberId)
  const [upsertWorkoutPlan, { isLoading: isSaving }] = useUpsertMemberWorkoutPlanMutation()

  const [name, setName] = useState('Workout Plan')
  const [description, setDescription] = useState('')
  const [days, setDays] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (planRes?.data) {
      const p = planRes.data
      setName(p.name || 'Workout Plan')
      setDescription(p.description || '')
      setDays(p.days?.length ? p.days : [getDefaultDay(1)])
      setIsInitialized(true)
    } else if (!isLoading && !isInitialized) {
      setDays([getDefaultDay(1)])
      setIsInitialized(true)
    }
  }, [planRes, isLoading, isInitialized])

  function getDefaultDay(num) {
    return {
      dayName: `Day ${num}`,
      focus: '',
      isRestDay: false,
      exercises: [
        { name: '', sets: 3, reps: '12', duration: '', restSeconds: 60, notes: '' },
      ],
    }
  }

  const addDay = () => {
    setDays((prev) => [...prev, getDefaultDay(prev.length + 1)])
  }

  const removeDay = (dayIdx) => {
    if (days.length === 1) {
      toast.error('Workout plan must contain at least one day')
      return
    }
    setDays((prev) => prev.filter((_, idx) => idx !== dayIdx))
  }

  const updateDay = (dayIdx, field, val) => {
    setDays((prev) =>
      prev.map((d, idx) => (idx === dayIdx ? { ...d, [field]: val } : d))
    )
  }

  const addExercise = (dayIdx) => {
    setDays((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx) return d
        return {
          ...d,
          exercises: [
            ...(d.exercises || []),
            { name: '', sets: 3, reps: '12', duration: '', restSeconds: 60, notes: '' },
          ],
        }
      })
    )
  }

  const removeExercise = (dayIdx, exIdx) => {
    setDays((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx) return d
        return {
          ...d,
          exercises: (d.exercises || []).filter((_, eIdx) => eIdx !== exIdx),
        }
      })
    )
  }

  const updateExercise = (dayIdx, exIdx, field, val) => {
    setDays((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx) return d
        return {
          ...d,
          exercises: (d.exercises || []).map((ex, eIdx) =>
            eIdx === exIdx ? { ...ex, [field]: val } : ex
          ),
        }
      })
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Plan name is required')
      return
    }
    try {
      await upsertWorkoutPlan({
        memberId,
        name: name.trim(),
        description: description.trim(),
        days,
      }).unwrap()
      toast.success('Workout plan saved successfully!')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save workout plan')
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        Loading workout plan...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Plan Header Info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
          <Dumbbell size={18} color="var(--color-accent)" /> Workout Plan Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="label">Plan Name *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 5-Day Push Pull Legs Split"
              required
            />
          </div>
          <div>
            <label className="label">Description / Instructions</label>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on progressive overload, drink 3L water daily"
            />
          </div>
        </div>
      </div>

      {/* Days List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                <input
                  className="input"
                  style={{ fontWeight: 600, width: '160px' }}
                  value={day.dayName}
                  onChange={(e) => updateDay(dayIdx, 'dayName', e.target.value)}
                  placeholder="Day Name (e.g. Day 1)"
                />
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={day.focus || ''}
                  onChange={(e) => updateDay(dayIdx, 'focus', e.target.value)}
                  placeholder="Focus area (e.g. Chest & Triceps)"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={day.isRestDay || false}
                    onChange={(e) => updateDay(dayIdx, 'isRestDay', e.target.checked)}
                  />
                  Rest Day
                </label>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ color: 'var(--color-danger)', padding: '0.4rem' }}
                  onClick={() => removeDay(dayIdx)}
                  title="Remove Day"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {!day.isRestDay ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Exercises ({day.exercises?.length || 0})
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => addExercise(dayIdx)}
                  >
                    <Plus size={14} /> Add Exercise
                  </button>
                </div>

                {day.exercises?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {day.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 80px 80px 100px 100px 1.5fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          padding: '0.5rem',
                          background: 'var(--color-bg-subtle, rgba(255,255,255,0.03))',
                          borderRadius: '8px',
                          border: '1px solid var(--color-bg-border)',
                        }}
                      >
                        <input
                          className="input"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.name}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                          placeholder="Exercise Name"
                        />
                        <input
                          className="input"
                          type="number"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.sets}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', Number(e.target.value) || 0)}
                          placeholder="Sets"
                          title="Sets"
                        />
                        <input
                          className="input"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.reps}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                          placeholder="Reps (e.g. 12)"
                          title="Reps"
                        />
                        <input
                          className="input"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.duration || ''}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'duration', e.target.value)}
                          placeholder="Duration (opt)"
                          title="Duration"
                        />
                        <input
                          className="input"
                          type="number"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.restSeconds}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'restSeconds', Number(e.target.value) || 0)}
                          placeholder="Rest (s)"
                          title="Rest in seconds"
                        />
                        <input
                          className="input"
                          style={{ fontSize: '0.85rem' }}
                          value={ex.notes || ''}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'notes', e.target.value)}
                          placeholder="Notes (e.g. drop set)"
                          title="Notes"
                        />
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ color: 'var(--color-danger)', padding: '0.35rem' }}
                          onClick={() => removeExercise(dayIdx, exIdx)}
                          title="Remove exercise"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    No exercises added yet for this day. Click "Add Exercise" to add one.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                😴 Rest & Recovery Day marked.
              </p>
            )}
          </div>
        ))}

        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={addDay}>
          <Plus size={16} /> Add Day
        </button>
      </div>

      {/* Save Action */}
      <div className="card" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save Workout Plan
        </button>
      </div>
    </form>
  )
}

function DietPlanTab({ memberId }) {
  const { data: planRes, isLoading } = useGetMemberDietPlanQuery(memberId)
  const [upsertDietPlan, { isLoading: isSaving }] = useUpsertMemberDietPlanMutation()

  const [name, setName] = useState('Diet Plan')
  const [goal, setGoal] = useState('maintenance')
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000)
  const [dailyProteinTarget, setDailyProteinTarget] = useState(150)
  const [dailyCarbsTarget, setDailyCarbsTarget] = useState(200)
  const [dailyFatsTarget, setDailyFatsTarget] = useState(60)
  const [notes, setNotes] = useState('')
  const [meals, setMeals] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (planRes?.data) {
      const p = planRes.data
      setName(p.name || 'Diet Plan')
      setGoal(p.goal || 'maintenance')
      setDailyCalorieTarget(p.dailyCalorieTarget ?? 2000)
      setDailyProteinTarget(p.dailyProteinTarget ?? 150)
      setDailyCarbsTarget(p.dailyCarbsTarget ?? 200)
      setDailyFatsTarget(p.dailyFatsTarget ?? 60)
      setNotes(p.notes || '')
      setMeals(p.meals?.length ? p.meals : [getDefaultMeal(1)])
      setIsInitialized(true)
    } else if (!isLoading && !isInitialized) {
      setMeals([getDefaultMeal(1)])
      setIsInitialized(true)
    }
  }, [planRes, isLoading, isInitialized])

  function getDefaultMeal(num) {
    return {
      mealName: `Meal ${num}`,
      time: '08:00 AM',
      notes: '',
      items: [
        { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 },
      ],
    }
  }

  const addMeal = () => {
    setMeals((prev) => [...prev, getDefaultMeal(prev.length + 1)])
  }

  const removeMeal = (mealIdx) => {
    if (meals.length === 1) {
      toast.error('Diet plan must contain at least one meal')
      return
    }
    setMeals((prev) => prev.filter((_, idx) => idx !== mealIdx))
  }

  const updateMeal = (mealIdx, field, val) => {
    setMeals((prev) =>
      prev.map((m, idx) => (idx === mealIdx ? { ...m, [field]: val } : m))
    )
  }

  const addFoodItem = (mealIdx) => {
    setMeals((prev) =>
      prev.map((m, idx) => {
        if (idx !== mealIdx) return m
        return {
          ...m,
          items: [
            ...(m.items || []),
            { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fats: 0 },
          ],
        }
      })
    )
  }

  const removeFoodItem = (mealIdx, itemIdx) => {
    setMeals((prev) =>
      prev.map((m, idx) => {
        if (idx !== mealIdx) return m
        return {
          ...m,
          items: (m.items || []).filter((_, iIdx) => iIdx !== itemIdx),
        }
      })
    )
  }

  const updateFoodItem = (mealIdx, itemIdx, field, val) => {
    setMeals((prev) =>
      prev.map((m, idx) => {
        if (idx !== mealIdx) return m
        return {
          ...m,
          items: (m.items || []).map((item, iIdx) =>
            iIdx === itemIdx ? { ...item, [field]: val } : item
          ),
        }
      })
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Plan name is required')
      return
    }
    try {
      await upsertDietPlan({
        memberId,
        name: name.trim(),
        goal,
        dailyCalorieTarget: Number(dailyCalorieTarget) || 0,
        dailyProteinTarget: Number(dailyProteinTarget) || 0,
        dailyCarbsTarget: Number(dailyCarbsTarget) || 0,
        dailyFatsTarget: Number(dailyFatsTarget) || 0,
        notes: notes.trim(),
        meals,
      }).unwrap()
      toast.success('Diet plan saved successfully!')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save diet plan')
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
        Loading diet plan...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Plan Header Info */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
          <Utensils size={18} color="var(--color-accent)" /> Diet Plan Details & Nutrition Targets
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="label">Plan Name *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muscle Gain High Protein"
              required
            />
          </div>

          <div>
            <label className="label">Primary Goal</label>
            <select
              className="input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintenance">Maintenance</option>
              <option value="lean_bulk">Lean Bulk</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="label">Daily Calorie Target (kcal)</label>
            <input
              className="input"
              type="number"
              value={dailyCalorieTarget}
              onChange={(e) => setDailyCalorieTarget(e.target.value)}
              placeholder="2000"
            />
          </div>

          <div>
            <label className="label">Protein Target (g)</label>
            <input
              className="input"
              type="number"
              value={dailyProteinTarget}
              onChange={(e) => setDailyProteinTarget(e.target.value)}
              placeholder="150"
            />
          </div>

          <div>
            <label className="label">Carbs Target (g)</label>
            <input
              className="input"
              type="number"
              value={dailyCarbsTarget}
              onChange={(e) => setDailyCarbsTarget(e.target.value)}
              placeholder="200"
            />
          </div>

          <div>
            <label className="label">Fats Target (g)</label>
            <input
              className="input"
              type="number"
              value={dailyFatsTarget}
              onChange={(e) => setDailyFatsTarget(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <div>
          <label className="label">Dietary Notes / Guidelines</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Drink 3-4L water, avoid sugar after 7 PM"
          />
        </div>
      </div>

      {/* Meals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {meals.map((meal, mealIdx) => (
          <div key={mealIdx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                <input
                  className="input"
                  style={{ fontWeight: 600, width: '160px' }}
                  value={meal.mealName}
                  onChange={(e) => updateMeal(mealIdx, 'mealName', e.target.value)}
                  placeholder="Meal Name (e.g. Breakfast)"
                />
                <input
                  className="input"
                  style={{ width: '130px' }}
                  value={meal.time || ''}
                  onChange={(e) => updateMeal(mealIdx, 'time', e.target.value)}
                  placeholder="Time (e.g. 8:00 AM)"
                />
                <input
                  className="input"
                  style={{ flex: 1 }}
                  value={meal.notes || ''}
                  onChange={(e) => updateMeal(mealIdx, 'notes', e.target.value)}
                  placeholder="Meal notes (e.g. Have within 30 min of waking)"
                />
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                style={{ color: 'var(--color-danger)', padding: '0.4rem' }}
                onClick={() => removeMeal(mealIdx)}
                title="Remove Meal"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Food Items ({meal.items?.length || 0})
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => addFoodItem(mealIdx)}
                >
                  <Plus size={14} /> Add Food Item
                </button>
              </div>

              {meal.items?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {meal.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.2fr 80px 80px 80px 80px auto',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.5rem',
                        background: 'var(--color-bg-subtle, rgba(255,255,255,0.03))',
                        borderRadius: '8px',
                        border: '1px solid var(--color-bg-border)',
                      }}
                    >
                      <input
                        className="input"
                        style={{ fontSize: '0.85rem' }}
                        value={item.name}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'name', e.target.value)}
                        placeholder="Food Item (e.g. Oats)"
                      />
                      <input
                        className="input"
                        style={{ fontSize: '0.85rem' }}
                        value={item.quantity || ''}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'quantity', e.target.value)}
                        placeholder="Qty (e.g. 100g)"
                      />
                      <input
                        className="input"
                        type="number"
                        style={{ fontSize: '0.85rem' }}
                        value={item.calories || 0}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'calories', Number(e.target.value) || 0)}
                        placeholder="Calories"
                        title="Calories (kcal)"
                      />
                      <input
                        className="input"
                        type="number"
                        style={{ fontSize: '0.85rem' }}
                        value={item.protein || 0}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'protein', Number(e.target.value) || 0)}
                        placeholder="Protein (g)"
                        title="Protein (g)"
                      />
                      <input
                        className="input"
                        type="number"
                        style={{ fontSize: '0.85rem' }}
                        value={item.carbs || 0}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'carbs', Number(e.target.value) || 0)}
                        placeholder="Carbs (g)"
                        title="Carbs (g)"
                      />
                      <input
                        className="input"
                        type="number"
                        style={{ fontSize: '0.85rem' }}
                        value={item.fats || 0}
                        onChange={(e) => updateFoodItem(mealIdx, itemIdx, 'fats', Number(e.target.value) || 0)}
                        placeholder="Fats (g)"
                        title="Fats (g)"
                      />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ color: 'var(--color-danger)', padding: '0.35rem' }}
                        onClick={() => removeFoodItem(mealIdx, itemIdx)}
                        title="Remove food item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                  No food items added yet for this meal. Click "Add Food Item" to add one.
                </p>
              )}
            </div>
          </div>
        ))}

        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={addMeal}>
          <Plus size={16} /> Add Meal
        </button>
      </div>

      {/* Save Action */}
      <div className="card" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={isSaving}>
          {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />} Save Diet Plan
        </button>
      </div>
    </form>
  )
}
