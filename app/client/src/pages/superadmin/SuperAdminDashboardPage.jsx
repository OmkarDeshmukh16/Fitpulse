import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  CreditCard,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Loader,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  useGetDemoRequestsQuery,
  useSendPaymentLinkMutation,
  useApproveGymMutation,
  useUpdateDemoRequestMutation,
} from '../../services/superadmin.api'

export default function SuperAdminDashboardPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useGetDemoRequestsQuery({ search, status: statusFilter, page })
  const [sendPaymentLink, { isLoading: isSendingLink }] = useSendPaymentLinkMutation()
  const [approveGym, { isLoading: isApproving }] = useApproveGymMutation()
  const [updateRequest] = useUpdateDemoRequestMutation()

  // Modal States
  const [paymentModalLead, setPaymentModalLead] = useState(null)
  const [paymentLink, setPaymentLink] = useState('')
  const [customMsg, setCustomMsg] = useState('')

  const [approveModalLead, setApproveModalLead] = useState(null)
  const [tempPassword, setTempPassword] = useState('')
  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [copied, setCopied] = useState(false)

  const requests = data?.data || []
  const summary = data?.summary || { total: 0, pending: 0, paymentSent: 0, approved: 0 }

  const handleOpenPaymentModal = (lead) => {
    setPaymentModalLead(lead)
    setPaymentLink(lead.paymentLink || 'https://razorpay.com/pay/fitpulse-gym-saas')
    setCustomMsg(lead.customMessage || 'Here is your custom payment link to activate your Fitpulse Gym SaaS subscription.')
  }

  const handleSendPaymentLink = async (e) => {
    e.preventDefault()
    if (!paymentLink.trim()) return toast.error('Please enter a payment link')

    try {
      const res = await sendPaymentLink({
        id: paymentModalLead._id,
        paymentLink,
        customMessage: customMsg,
      }).unwrap()

      toast.success(res.message || 'Payment link sent successfully!')
      setPaymentModalLead(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send payment link')
    }
  }

  const handleOpenApproveModal = (lead) => {
    setApproveModalLead(lead)
    setTempPassword(`Fitpulse@${Math.floor(1000 + Math.random() * 9000)}`)
    setCreatedCredentials(null)
  }

  const handleApproveGym = async (e) => {
    e.preventDefault()
    try {
      const res = await approveGym({
        id: approveModalLead._id,
        password: tempPassword,
      }).unwrap()

      toast.success(`Gym "${approveModalLead.gymName}" provisioned successfully!`)
      setCreatedCredentials(res.data.credentials)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to provision gym')
    }
  }

  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const loginUrl = import.meta.env.VITE_DASHBOARD_URL ? `${import.meta.env.VITE_DASHBOARD_URL}/login` : `${window.location.origin}/login`
    const text = `Fitpulse SaaS Gym Credentials:\nURL: ${loginUrl}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Credentials copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRejectLead = async (id) => {
    if (!window.confirm('Are you sure you want to mark this lead as rejected?')) return
    try {
      await updateRequest({ id, status: 'rejected' }).unwrap()
      toast.success('Lead marked as rejected')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const statusBadges = {
    pending: { label: 'Pending Review', color: '#f59e0b', bg: '#f59e0b20' },
    payment_link_sent: { label: 'Payment Link Sent', color: '#3b82f6', bg: '#3b82f620' },
    approved: { label: 'Approved & Active', color: '#10b981', bg: '#10b98120' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: '#ef444420' },
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
              <ShieldCheck size={14} style={{ marginRight: 4 }} /> Super Admin Portal
            </span>
          </div>
          <h1 className="page-title">Gym Demo Requests & Onboarding</h1>
          <p className="page-subtitle">Review incoming leads, send payment links, and provision gym SaaS accounts</p>
        </div>
        <button className="btn btn-secondary" onClick={() => refetch()} id="refresh-superadmin">
          <RefreshCw size={16} /> Refresh Requests
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Building2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Leads</span>
            <span className="stat-value">{summary.total}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{summary.pending}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <CreditCard size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Payment Link Sent</span>
            <span className="stat-value" style={{ color: '#60a5fa' }}>{summary.paymentSent}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Approved & Provisioned</span>
            <span className="stat-value" style={{ color: '#34d399' }}>{summary.approved}</span>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 260 }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                className="input"
                placeholder="Search gym, owner, email, city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36 }}
                id="search-leads-input"
              />
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: '', label: 'All Statuses' },
            { id: 'pending', label: 'Pending' },
            { id: 'payment_link_sent', label: 'Payment Sent' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`btn ${statusFilter === st.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Gym & Owner</th>
                <th>Contact Info</th>
                <th>Location</th>
                <th>Est. Members</th>
                <th>Status</th>
                <th>Request Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader size={24} className="spin" style={{ margin: '0 auto', color: 'var(--color-accent)' }} />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No demo requests found.
                  </td>
                </tr>
              ) : (
                requests.map((lead) => {
                  const badge = statusBadges[lead.status] || { label: lead.status, color: '#aaa', bg: '#aaa20' }
                  return (
                    <tr key={lead._id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                            {lead.gymName}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Owner: {lead.ownerName}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                          <span>{lead.email}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>{lead.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{lead.city || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}>
                          {lead.memberCount} members
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: badge.bg, color: badge.color, fontWeight: 600 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {/* Send Payment Link Button */}
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#60a5fa' }}
                            onClick={() => handleOpenPaymentModal(lead)}
                            title="Send Payment Link"
                          >
                            <CreditCard size={15} /> Payment Link
                          </button>

                          {/* Approve & Provision Gym Button */}
                          {lead.status !== 'approved' && (
                            <button
                              className="btn btn-primary"
                              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                              onClick={() => handleOpenApproveModal(lead)}
                              title="Approve & Create Gym Tenant"
                            >
                              <Sparkles size={15} /> Approve & Provision
                            </button>
                          )}

                          {/* Rejection */}
                          {lead.status !== 'approved' && lead.status !== 'rejected' && (
                            <button
                              className="btn btn-ghost"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#ef4444' }}
                              onClick={() => handleRejectLead(lead._id)}
                              title="Reject Request"
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Send Payment Link Modal */}
      {paymentModalLead && (
        <div className="modal-backdrop">
          <div className="modal-content card" style={{ maxWidth: 520, width: '90%' }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="#3b82f6" /> Send Payment Link to Gym
              </h3>
              <button className="btn btn-ghost" onClick={() => setPaymentModalLead(null)} style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Send payment instructions for <strong>{paymentModalLead.gymName}</strong> ({paymentModalLead.email}).
            </p>

            <form onSubmit={handleSendPaymentLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Payment URL (Razorpay / UPI / Custom) *</label>
                <input
                  className="input"
                  required
                  value={paymentLink}
                  onChange={e => setPaymentLink(e.target.value)}
                  placeholder="https://razorpay.com/pay/your-link"
                />
              </div>

              <div className="form-group">
                <label className="label">Custom Note / Message for Gym Owner</label>
                <textarea
                  className="input"
                  rows={3}
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Additional payment terms or onboarding notes..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalLead(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSendingLink}>
                  {isSendingLink ? <Loader size={16} className="spin" /> : <><Send size={15} /> Send Payment Link</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Approve & Provision Gym Modal */}
      {approveModalLead && (
        <div className="modal-backdrop">
          <div className="modal-content card" style={{ maxWidth: 540, width: '90%' }}>
            <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--color-accent)" /> Provision Gym Account
              </h3>
              <button className="btn btn-ghost" onClick={() => setApproveModalLead(null)} style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {createdCredentials ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '1rem', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <CheckCircle size={20} /> Gym SaaS Account Created!
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Gym tenant <strong>{approveModalLead.gymName}</strong> is active. You can copy the credentials below or they have been sent via email.
                  </p>
                </div>

                <div className="card" style={{ background: 'var(--color-bg-secondary)', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Login URL:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.75rem' }}>{import.meta.env.VITE_DASHBOARD_URL ? `${import.meta.env.VITE_DASHBOARD_URL}/login` : `${window.location.origin}/login`}</div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Gym Owner Email:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600, marginBottom: '0.75rem' }}>{createdCredentials.email}</div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Temporary Password:</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: '1.1rem' }}>{createdCredentials.password}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={handleCopyCredentials}>
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy Credentials'}
                  </button>
                  <button className="btn btn-primary" onClick={() => setApproveModalLead(null)}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApproveGym} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  This will create a dedicated Gym Tenant for <strong>{approveModalLead.gymName}</strong> and generate a Gym Owner account for <strong>{approveModalLead.ownerName}</strong> ({approveModalLead.email}).
                </p>

                <div className="form-group">
                  <label className="label">Set Temporary Admin Password</label>
                  <input
                    className="input"
                    required
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setApproveModalLead(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isApproving}>
                    {isApproving ? <Loader size={16} className="spin" /> : 'Provision Gym & Activate'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
