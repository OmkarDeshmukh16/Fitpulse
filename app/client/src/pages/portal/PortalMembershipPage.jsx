import { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Calendar, Clock, Check, CreditCard, Loader, Zap, Shield, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetPortalMembershipQuery, useCreateRenewalOrderMutation, useVerifyRenewalPaymentMutation } from '../../services/portal.api'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export default function PortalMembershipPage() {
  const { data, isLoading } = useGetPortalMembershipQuery()
  const [createOrder, { isLoading: creatingOrder }] = useCreateRenewalOrderMutation()
  const [verifyPayment] = useVerifyRenewalPaymentMutation()
  const [selectedPlan, setSelectedPlan] = useState(null)

  const d = data?.data
  const current = d?.current
  const plans = d?.availablePlans || []

  const daysRemaining = current
    ? Math.max(0, Math.ceil((new Date(current.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  const handleRenew = async (planId) => {
    try {
      const res = await createOrder({ planId }).unwrap()
      const orderData = res.data

      // Load Razorpay script dynamically
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Fitpulse',
          description: `${orderData.plan.name} - ${orderData.plan.durationDays} days`,
          order_id: orderData.orderId,
          prefill: {
            name: orderData.member.fullName,
            email: orderData.member.email,
            contact: orderData.member.phone,
          },
          theme: { color: '#10b981' },
          handler: async (response) => {
            try {
              await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }).unwrap()
              toast.success('Membership renewed successfully! 🎉')
              setSelectedPlan(null)
            } catch (err) {
              toast.error(err?.data?.message || 'Payment verification failed')
            }
          },
          modal: {
            ondismiss: () => toast.error('Payment cancelled'),
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
      document.body.appendChild(script)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create payment order')
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
      {/* Current Membership */}
      <motion.div {...fadeUp} className="card" style={{
        marginBottom: '2rem',
        background: current
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.03))'
          : 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.03))',
        border: `1px solid ${current ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: current ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Award size={24} color={current ? '#10b981' : '#ef4444'} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {current ? current.planId?.name : 'No Active Membership'}
                </h2>
                <span className={`badge ${current ? 'badge-active' : 'badge-inactive'}`}>
                  {d?.membershipStatus || 'inactive'}
                </span>
              </div>
            </div>
            {current && (
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(current.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(current.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} color="var(--color-text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: daysRemaining <= 7 ? '#f59e0b' : 'var(--color-text-secondary)', fontWeight: daysRemaining <= 7 ? 600 : 400 }}>
                    {daysRemaining} days remaining
                  </span>
                </div>
              </div>
            )}
            {/* Plan Features */}
            {current?.planId?.features?.length > 0 && (
              <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {current.planId.features.map((f, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.75rem', borderRadius: 99, fontSize: '0.75rem',
                    background: 'rgba(16,185,129,0.08)', color: '#10b981', fontWeight: 500,
                  }}>
                    <Check size={12} /> {f}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Days remaining ring */}
          {current && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: `conic-gradient(#10b981 ${(daysRemaining / (current.planId?.durationDays || 30)) * 360}deg, var(--color-bg-border) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'var(--color-bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{daysRemaining}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>days left</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Available Plans for Renewal */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
          {current ? 'Renew Membership' : 'Choose a Plan'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {plans.map((plan, i) => {
            const isSelected = selectedPlan === plan._id
            const isCurrent = current?.planId?._id === plan._id
            return (
              <motion.div
                key={plan._id}
                {...fadeUp}
                transition={{ delay: 0.05 * (i + 1) }}
                className="card"
                style={{
                  position: 'relative', cursor: 'pointer',
                  border: isSelected ? '1px solid #10b981' : isCurrent ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--color-bg-border)',
                  boxShadow: isSelected ? '0 0 20px rgba(16,185,129,0.2)' : 'var(--shadow-card)',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedPlan(plan._id)}
              >
                {isCurrent && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '0.2rem 0.5rem', borderRadius: 99,
                    background: 'rgba(16,185,129,0.15)', color: '#10b981',
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                  }}>
                    <Star size={10} /> Current
                  </div>
                )}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: plan.color || '#10b981',
                  marginBottom: '0.75rem',
                }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  {plan.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>₹{plan.price?.toLocaleString()}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>/ {plan.durationDays} days</span>
                </div>
                {plan.features?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1rem' }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <Check size={14} color="#10b981" /> {f}
                      </div>
                    ))}
                  </div>
                )}
                {plan.personalTrainingIncluded && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.25rem 0.625rem', borderRadius: 99,
                    background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                    fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.75rem',
                  }}>
                    <Shield size={12} /> Personal Training Included
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  style={{
                    width: '100%', justifyContent: 'center', marginTop: '0.5rem',
                    background: isSelected ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dark))',
                    boxShadow: isSelected ? '0 4px 15px rgba(16,185,129,0.4)' : 'var(--shadow-button)',
                  }}
                  onClick={(e) => { e.stopPropagation(); handleRenew(plan._id) }}
                  disabled={creatingOrder}
                >
                  {creatingOrder && selectedPlan === plan._id ? <Loader size={16} className="spin" /> : <CreditCard size={16} />}
                  {isCurrent ? 'Renew' : 'Subscribe'} Online
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Membership History */}
      {d?.history?.length > 1 && (
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Membership History</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.history.map((m) => (
                  <tr key={m._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.planId?.name || '—'}</td>
                    <td>{new Date(m.startDate).toLocaleDateString('en-IN')}</td>
                    <td>{new Date(m.endDate).toLocaleDateString('en-IN')}</td>
                    <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
