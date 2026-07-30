import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Download, Loader, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useGetPaymentsQuery, useCreatePaymentMutation } from '../../services/api'
import { useGetMembersQuery } from '../../services/members.api'

const methodColors = { cash: '#10b981', card: '#3b82f6', upi: '#8b5cf6', bank_transfer: '#f59e0b', other: '#94a3b8' }

function RecordPaymentModal({ onClose }) {
  const [form, setForm] = useState({ memberId: '', amount: '', paidAmount: '', method: 'cash', transactionId: '', gstPercent: 0, notes: '' })
  const [createPayment, { isLoading }] = useCreatePaymentMutation()
  const { data: membersData } = useGetMembersQuery({ status: 'active', limit: 100 })
  const members = membersData?.data || []
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createPayment({ ...form, paidAmount: form.paidAmount || form.amount }).unwrap()
      toast.success('Payment recorded!')
      onClose()
    } catch (err) { toast.error(err?.data?.message || 'Failed') }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal slide-up" onClick={e => e.stopPropagation()}>
        <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Record Payment</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="label">Member *</label>
            <select className="input" value={form.memberId} onChange={e => set('memberId', e.target.value)} required id="payment-member">
              <option value="">Select member...</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.fullName} ({m.memberId})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Total Amount (₹) *</label>
              <input className="input" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} required min={1} id="payment-amount" />
            </div>
            <div className="form-group">
              <label className="label">Paid Amount (₹)</label>
              <input className="input" type="number" value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} placeholder="Leave blank if fully paid" id="payment-paid" />
            </div>
            <div className="form-group">
              <label className="label">Payment Method *</label>
              <select className="input" value={form.method} onChange={e => set('method', e.target.value)} id="payment-method">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">GST %</label>
              <input className="input" type="number" value={form.gstPercent} onChange={e => set('gstPercent', e.target.value)} min={0} max={28} id="payment-gst" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Transaction ID</label>
            <input className="input" value={form.transactionId} onChange={e => set('transactionId', e.target.value)} placeholder="UPI ref, cheque no, etc." id="payment-txn" />
          </div>
          <div className="form-group">
            <label className="label">Notes</label>
            <input className="input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional note..." id="payment-notes" />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
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
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useGetPaymentsQuery({ status: statusFilter, method: methodFilter, page, limit: 20 })
  const payments = data?.data || []
  const pagination = data?.pagination || {}

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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1) }}>
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr><th>Invoice</th><th>Member</th><th>Amount</th><th>Paid</th><th>Due</th><th>Method</th><th>Date</th><th>Status</th><th>Receipt</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td><span style={{ fontFamily: 'monospace', color: 'var(--color-accent-light)', fontSize: '0.8rem' }}>{p.invoiceNumber}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{p.memberId?.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.memberId?.memberId}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>₹{p.amount?.toLocaleString()}</td>
                    <td style={{ color: 'var(--color-success)' }}>₹{p.paidAmount?.toLocaleString()}</td>
                    <td style={{ color: p.dueAmount > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>₹{p.dueAmount?.toLocaleString()}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: methodColors[p.method] || '#fff', textTransform: 'uppercase' }}>
                        {p.method?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{p.date ? format(new Date(p.date), 'dd MMM yyyy') : '—'}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <a href={`/api/payments/${p._id}/receipt`} target="_blank" rel="noreferrer">
                        <button className="btn btn-ghost" style={{ padding: '0.3rem', color: 'var(--color-accent)' }} title="Download Receipt">
                          <Receipt size={15} />
                        </button>
                      </a>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>No payments recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Page {page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Prev</button>
              <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && <RecordPaymentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
