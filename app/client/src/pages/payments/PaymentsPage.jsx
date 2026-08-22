import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Loader, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useGetPaymentsQuery, useCreatePaymentMutation } from '../../services/api'
import { useGetMembersQuery } from '../../services/members.api'
import SearchableSelect from '../../components/common/SearchableSelect'

const methodColors = { cash: '#10b981', card: '#3b82f6', upi: '#8b5cf6', other: '#94a3b8' }

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card (Debit / Credit)' },
  { value: 'other', label: 'Other' },
]

function RecordPaymentModal({ onClose }) {
  const [form, setForm] = useState({
    memberId: '',
    amount: '',
    paidAmount: '',
    method: 'cash',
    notes: '',
  })
  const [createPayment, { isLoading }] = useCreatePaymentMutation()
  const { data: membersData } = useGetMembersQuery({ status: 'active', limit: 150 })
  const members = membersData?.data || []
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const memberOptions = members.map((m) => ({
    value: m._id,
    label: m.fullName,
    sublabel: `${m.memberId}${m.phone ? ` • ${m.phone}` : ''}`,
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.memberId) {
      toast.error('Please select a member')
      return
    }
    try {
      await createPayment({ ...form, paidAmount: form.paidAmount || form.amount }).unwrap()
      toast.success('Payment recorded successfully!')
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to record payment')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
          Record Payment
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Member *</label>
            <SearchableSelect
              options={memberOptions}
              value={form.memberId}
              onChange={(val) => set('memberId', val)}
              placeholder="Search member by name or ID..."
              searchPlaceholder="Type member name, ID, or phone..."
              id="payment-member"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Total Amount (₹) *</label>
              <input
                className="input"
                type="number"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                required
                min={1}
                id="payment-amount"
                placeholder="₹ Amount"
              />
            </div>
            <div className="form-group">
              <label className="label">Paid Amount (₹)</label>
              <input
                className="input"
                type="number"
                value={form.paidAmount}
                onChange={(e) => set('paidAmount', e.target.value)}
                placeholder="Blank if full"
                id="payment-paid"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Payment Method *</label>
            <SearchableSelect
              options={PAYMENT_METHODS}
              value={form.method}
              onChange={(val) => set('method', val)}
              placeholder="Select payment method..."
              id="payment-method"
            />
          </div>

          <div className="form-group">
            <label className="label">Notes</label>
            <input
              className="input"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Optional transaction note..."
              id="payment-notes"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="payment-submit" disabled={isLoading}>
              {isLoading ? <Loader size={16} className="spin" /> : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rangeParam = searchParams.get('range') || ''
  const statusParam = searchParams.get('status') || ''

  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState(statusParam)
  const [methodFilter, setMethodFilter] = useState('')
  const [rangeFilter, setRangeFilter] = useState(rangeParam)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setRangeFilter(rangeParam)
    setStatusFilter(statusParam)
    setPage(1)
  }, [rangeParam, statusParam])

  const { data, isLoading } = useGetPaymentsQuery({
    status: statusFilter,
    method: methodFilter,
    range: rangeFilter,
    page,
    limit: 20,
  })
  const payments = data?.data || []
  const pagination = data?.pagination || {}

  const handleDownloadReceipt = async (paymentId, invoiceNumber) => {
    try {
      const token = localStorage.getItem('accessToken')
      const envUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/$/, '')
      const baseUrl = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`
      const response = await fetch(`${baseUrl}/payments/${paymentId}/receipt`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Download failed' }))
        toast.error(err.message || 'Failed to download receipt')
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${invoiceNumber || paymentId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Receipt downloaded')
    } catch (err) {
      toast.error('Failed to download receipt')
    }
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'pending', label: 'Pending' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const methodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">{pagination.total || 0} total transactions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="record-payment-btn">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Filters with SearchableSelect */}
      <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 450 }}>
        <div style={{ flex: 1 }}>
          <SearchableSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val)
              if (val) setSearchParams({ status: val, ...(rangeFilter ? { range: rangeFilter } : {}) })
              else setSearchParams(rangeFilter ? { range: rangeFilter } : {})
              setPage(1)
            }}
            placeholder="Filter Status"
          />
        </div>
        <div style={{ flex: 1 }}>
          <SearchableSelect
            options={methodOptions}
            value={methodFilter}
            onChange={(val) => {
              setMethodFilter(val)
              setPage(1)
            }}
            placeholder="Filter Method"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)', fontSize: '0.8rem' }}>
                        {p.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                        {p.memberId?.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {p.memberId?.memberId}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{p.amount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--color-success)' }}>₹{p.paidAmount?.toLocaleString()}</td>
                    <td style={{ color: p.dueAmount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                      ₹{p.dueAmount?.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: methodColors[p.method] || '#fff', textTransform: 'uppercase' }}>
                        {p.method?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{p.date ? format(new Date(p.date), 'dd MMM yyyy') : '—'}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem', color: 'var(--color-accent)' }}
                        title="Download Receipt"
                        onClick={() => handleDownloadReceipt(p._id, p.invoiceNumber)}
                      >
                        <Receipt size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                      {rangeFilter === 'today'
                        ? 'No transactions found for today'
                        : rangeFilter === 'month'
                        ? 'No transactions found for this month'
                        : 'No payments recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Page {page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setPage((p) => p - 1)} disabled={page === 1} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Prev</button>
              <button className="btn btn-secondary" onClick={() => setPage((p) => p + 1)} disabled={page === pagination.pages} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && <RecordPaymentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
