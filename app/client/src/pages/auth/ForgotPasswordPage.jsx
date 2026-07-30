import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell, ArrowLeft, Loader, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForgotPasswordMutation } from '../../services/auth.api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword({ email }).unwrap()
      setSent(true)
      toast.success('Reset link sent if email exists')
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Dumbbell size={22} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Forgot Password</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            We'll send a reset link to your email
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <Mail size={40} color="var(--color-success)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                If an account exists for <strong>{email}</strong>, you'll receive a reset link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="admin@gym.com" value={email} onChange={(e) => setEmail(e.target.value)} required id="forgot-email" />
              </div>
              <button className="btn btn-primary" type="submit" disabled={isLoading} id="forgot-submit" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                {isLoading ? <Loader size={18} className="spin" /> : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: 'var(--color-accent)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
