import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Phone, Mail, Calendar, User, Snowflake, Trash2, MapPin, HeartPulse, Shield, CreditCard, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  useGetMemberQuery,
  useGetMemberAttendanceQuery,
  useGetMemberPaymentsQuery,
  useFreezeMembershipMutation,
  useUnfreezeMembershipMutation,
  useDeleteMemberMutation,
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
  const [deleteMember] = useDeleteMemberMutation()

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

  const handleDelete = async () => {
    if (!member) return
    if (!window.confirm(`Delete member "${member.fullName}"? This action cannot be undone.`)) return
    try {
      await deleteMember(id).unwrap()
      toast.success('Member deleted successfully')
      navigate('/members')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete member')
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

          <button className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '0.5rem 0.75rem' }} onClick={handleDelete} title="Delete Member">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--color-bg-border)', paddingBottom: '0.5rem' }}>
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
    </div>
  )
}
