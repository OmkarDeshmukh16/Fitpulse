import { motion } from 'framer-motion'
import { CreditCard, Download, FileText, Loader } from 'lucide-react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { useGetPortalPaymentsQuery } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

const statusConfig = {
  paid: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Paid' },
  partial: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Partial' },
  pending: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Pending' },
  refunded: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', label: 'Refunded' },
}

const methodLabels = {
  cash: 'Cash', card: 'Card', upi: 'UPI', bank_transfer: 'Bank Transfer', other: 'Other',
}

export default function PortalPaymentsPage() {
  const { data, isLoading } = useGetPortalPaymentsQuery({ limit: 50 })
  const accessToken = useSelector((s) => s.auth.accessToken)

  const payments = data?.data || []

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.paidAmount, 0)

  const handleDownloadReceipt = async (paymentId, invoiceNumber) => {
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/$/, '')
      const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`
      const url = `${baseUrl}/portal/payments/${paymentId}/receipt?token=${accessToken}`

      const link = document.createElement('a')
      link.href = url
      link.download = `receipt_${invoiceNumber}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Receipt downloading...')
    } catch {
      toast.error('Failed to download receipt')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spin" style={{ width: 32, height: 32, border: '3px solid var(--color-bg-border)', borderTopColor: '#10b981', borderRadius: '50%' }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div {...fadeUp} className="stat-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #10b981, transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CreditCard size={16} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Paid</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>₹{totalPaid.toLocaleString()}</div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="stat-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #6366f1, transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText size={16} color="#6366f1" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total Transactions</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{payments.length}</div>
        </motion.div>
      </div>

      {/* Payments Table */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Payment History</h3>
        {payments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            No payment records found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {payments.map((p, i) => {
              const sc = statusConfig[p.status] || statusConfig.pending
              return (
                <motion.div
                  key={p._id}
                  {...fadeUp}
                  transition={{ delay: 0.03 * i }}
                  className="card"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <CreditCard size={20} color={sc.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {p.invoiceNumber}
                      </span>
                      <span style={{
                        display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: 99,
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        background: sc.bg, color: sc.color,
                      }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <span>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>{methodLabels[p.method] || p.method}</span>
                      {p.transactionId && <span style={{ fontSize: '0.7rem' }}>ID: {p.transactionId.slice(0, 16)}...</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      ₹{p.paidAmount?.toLocaleString() || p.amount?.toLocaleString()}
                    </div>
                    {p.dueAmount > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Due: ₹{p.dueAmount.toLocaleString()}</div>
                    )}
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleDownloadReceipt(p._id, p.invoiceNumber)}
                    title="Download Receipt"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <Download size={14} /> Receipt
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
