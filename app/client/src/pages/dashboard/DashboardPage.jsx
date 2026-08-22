import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, UserCheck, UserX, UserPlus, CalendarCheck, DollarSign,
  TrendingUp, Clock, AlertTriangle, CakeSlice, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { useSelector } from 'react-redux'
import {
  useGetDashboardStatsQuery, useGetRevenueChartQuery,
  useGetAttendanceChartQuery, useGetRecentActivityQuery,
} from '../../services/api'
import { selectGymSettings } from '../../redux/slices/authSlice'
import { format } from 'date-fns'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444']

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function StatCard({ icon: Icon, label, value, color, trend, onClick }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>{label}</p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
            {value ?? <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>—</span>}
          </p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </motion.div>
  )
}

const chartTooltipStyle = {
  contentStyle: {
    background: '#12122a',
    border: '1px solid #1e1e38',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: 12,
  },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const gymSettings = useSelector(selectGymSettings)
  const sym = gymSettings?.currencySymbol || '₹'

  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery()
  const { data: revenueData } = useGetRevenueChartQuery({ months: 6 })
  const { data: attendanceData } = useGetAttendanceChartQuery({ days: 30 })
  const { data: activityData } = useGetRecentActivityQuery()

  const stats = statsData?.data || {}
  const revenue = (revenueData?.data || []).map((d) => ({
    name: monthNames[(d._id.month || 1) - 1],
    revenue: d.revenue,
  }))
  const attendance = (attendanceData?.data || []).map((d) => ({
    name: d._id?.slice(5), // MM-DD
    count: d.count,
  }))

  const memberDist = [
    { name: 'Active', value: stats.activeMembers || 0 },
    { name: 'Inactive', value: stats.inactiveMembers || 0 },
    { name: 'New', value: stats.newMembersThisMonth || 0 },
  ]

  const recentActivity = activityData?.data || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="fade-in">
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', gap: '0.875rem' }}>
        <StatCard icon={Users} label="Total Members" value={stats.totalMembers} color="#6366f1" onClick={() => navigate('/members')} />
        <StatCard icon={UserCheck} label="Active Members" value={stats.activeMembers} color="#10b981" onClick={() => navigate('/members?status=active')} />
        <StatCard icon={UserX} label="Inactive Members" value={stats.inactiveMembers} color="#ef4444" onClick={() => navigate('/members?status=inactive')} />
        <StatCard icon={UserPlus} label="New This Month" value={stats.newMembersThisMonth} color="#3b82f6" onClick={() => navigate('/members?filter=newThisMonth')} />
        <StatCard icon={CalendarCheck} label="Today's Check-ins" value={stats.todayCheckIns} color="#8b5cf6" onClick={() => navigate('/attendance')} />
        <StatCard icon={DollarSign} label={`Today's Revenue`} value={stats.todayRevenue != null ? `${sym}${stats.todayRevenue.toLocaleString()}` : null} color="#10b981" onClick={() => navigate('/payments?range=today')} />
        <StatCard icon={TrendingUp} label="Monthly Revenue" value={stats.monthlyRevenue != null ? `${sym}${stats.monthlyRevenue.toLocaleString()}` : null} color="#6366f1" onClick={() => navigate('/payments?range=month')} />
        <StatCard icon={Clock} label="Pending Dues" value={stats.pendingPayments != null ? `${sym}${stats.pendingPayments.toLocaleString()}` : null} color="#f59e0b" onClick={() => navigate('/payments?status=partial')} />
        <StatCard icon={AlertTriangle} label="Expiring (7 days)" value={stats.expiringMemberships} color="#ef4444" onClick={() => navigate('/reports')} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {/* Revenue Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => [`${sym}${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Daily Attendance (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendance.slice(-20)}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Membership Distribution */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Membership Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={memberDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                {memberDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {memberDist.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Birthdays */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CakeSlice size={16} color="var(--color-warning)" /> Today's Birthdays
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(recentActivity.todayBirthdays || []).length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No birthdays today 🎂</p>
            ) : (recentActivity.todayBirthdays || []).map((m) => (
              <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--color-bg-hover)', borderRadius: 8 }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                  {m.fullName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={16} color="var(--color-accent)" /> Upcoming Renewals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto' }}>
            {(recentActivity.upcomingRenewals || []).length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No renewals this week</p>
            ) : (recentActivity.upcomingRenewals || []).map((r) => (
              <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--color-bg-hover)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.memberId?.fullName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{r.planId?.name}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                  {format(new Date(r.endDate), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
