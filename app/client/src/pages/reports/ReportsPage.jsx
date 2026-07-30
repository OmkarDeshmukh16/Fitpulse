import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, CalendarRange, Download, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { apiSlice } from '../../services/apiSlice'
import { useSelector } from 'react-redux'
import { selectGymSettings } from '../../redux/slices/authSlice'

const chartStyle = {
  contentStyle: { background: '#12122a', border: '1px solid #1e1e38', borderRadius: 10, color: '#f1f5f9', fontSize: 12 },
}

const tabs = ['Revenue', 'Attendance', 'Expiry', 'Lost Members']

// Quick API hooks using RTK Query directly
const { useGetRevenueReportQuery, useGetAttendanceReportQuery, useGetExpiryReportQuery, useGetLostMembersQuery } = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getRevenueReport: b.query({ query: (p) => ({ url: '/reports/revenue', params: p }) }),
    getAttendanceReport: b.query({ query: (p) => ({ url: '/reports/attendance', params: p }) }),
    getExpiryReport: b.query({ query: (p) => ({ url: '/reports/expiry', params: p }) }),
    getLostMembers: b.query({ query: () => '/reports/lost-members' }),
  }),
})

export default function ReportsPage() {
  const gymSettings = useSelector(selectGymSettings)
  const sym = gymSettings?.currencySymbol || '₹'
  const [activeTab, setActiveTab] = useState('Revenue')
  const today = format(new Date(), 'yyyy-MM-dd')
  const monthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd')
  const [dateRange, setDateRange] = useState({ startDate: monthStart, endDate: today })

  const { data: revenueData } = useGetRevenueReportQuery(dateRange, { skip: activeTab !== 'Revenue' })
  const { data: attendanceData } = useGetAttendanceReportQuery(dateRange, { skip: activeTab !== 'Attendance' })
  const { data: expiryData } = useGetExpiryReportQuery({ days: 30 }, { skip: activeTab !== 'Expiry' })
  const { data: lostData } = useGetLostMembersQuery(undefined, { skip: activeTab !== 'Lost Members' })

  const revenueChart = (revenueData?.data || []).map(d => ({ name: `${d._id.day || ''}/${d._id.month}`, revenue: d.revenue }))
  const attendanceChart = (attendanceData?.data || []).map(d => ({ name: d._id?.slice(5), count: d.count }))
  const revSummary = revenueData?.summary || {}

  const handleExport = (fmt) => {
    const params = new URLSearchParams({ format: fmt, ...dateRange })
    window.open(`/api/reports/export/payments?${params}`, '_blank')
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analytics and insights</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')} id="export-csv"><Download size={15} /> CSV</button>
          <button className="btn btn-secondary" onClick={() => handleExport('excel')} id="export-excel"><Download size={15} /> Excel</button>
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <CalendarRange size={16} /> Date Range:
        </div>
        <input className="input" type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))} style={{ width: 'auto' }} />
        <span style={{ color: 'var(--color-text-muted)' }}>to</span>
        <input className="input" type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))} style={{ width: 'auto' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-bg-secondary)', padding: '0.25rem', borderRadius: 10, border: '1px solid var(--color-bg-border)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t} id={`tab-${t.toLowerCase().replace(' ', '-')}`} onClick={() => setActiveTab(t)}
            style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: activeTab === t ? 'var(--color-accent)' : 'transparent', color: activeTab === t ? '#fff' : 'var(--color-text-muted)', transition: 'all 0.2s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === 'Revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Total Revenue', value: `${sym}${(revSummary.totalRevenue || 0).toLocaleString()}`, color: '#6366f1' },
              { label: 'Transactions', value: revSummary.totalTransactions || 0, color: '#10b981' },
              { label: 'Avg Transaction', value: `${sym}${Math.round(revSummary.avgTransaction || 0).toLocaleString()}`, color: '#3b82f6' },
              { label: 'Pending Dues', value: `${sym}${(revSummary.pendingDues || 0).toLocaleString()}`, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{s.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartStyle} formatter={v => [`${sym}${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'Attendance' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Total Check-ins</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6366f1' }}>{attendanceData?.summary?.totalCheckIns || 0}</p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Unique Members</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{attendanceData?.summary?.uniqueMembers || 0}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceChart}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartStyle} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expiry Tab */}
      {activeTab === 'Expiry' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Memberships Expiring (Next 30 Days) — {expiryData?.count || 0}</h3>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Member</th><th>Plan</th><th>Expires</th><th>Days Left</th></tr></thead>
              <tbody>
                {(expiryData?.data || []).map(r => {
                  const daysLeft = Math.ceil((new Date(r.endDate) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.memberId?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.memberId?.phone}</div>
                      </td>
                      <td>{r.planId?.name}</td>
                      <td>{format(new Date(r.endDate), 'dd MMM yyyy')}</td>
                      <td><span className={`badge ${daysLeft <= 3 ? 'badge-inactive' : 'badge-pending'}`}>{daysLeft}d</span></td>
                    </tr>
                  )
                })}
                {!expiryData?.data?.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No expiring memberships.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lost Members Tab */}
      {activeTab === 'Lost Members' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingDown size={16} color="var(--color-danger)" />
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Inactive / Lapsed Members — {lostData?.count || 0}</h3>
          </div>
          <div className="table-container">
            <table>
              <thead><tr><th>Member</th><th>Phone</th><th>Last Plan</th><th>Status</th></tr></thead>
              <tbody>
                {(lostData?.data || []).map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.memberId}</div>
                    </td>
                    <td>{m.phone}</td>
                    <td>{m.currentPlanId?.name || '—'}</td>
                    <td><span className={`badge badge-${m.membershipStatus}`}>{m.membershipStatus}</span></td>
                  </tr>
                ))}
                {!lostData?.data?.length && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No lapsed members. Great retention! 🎉</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
