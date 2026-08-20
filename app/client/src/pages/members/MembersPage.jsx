import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, UserCheck, UserX, Eye, Edit, Download, Snowflake } from 'lucide-react'
import toast from 'react-hot-toast'
import { useGetMembersQuery, useFreezeMembershipMutation } from '../../services/members.api'
import { format } from 'date-fns'

const statusBadge = (status) => {
  const map = { active: 'active', inactive: 'inactive', frozen: 'frozen', expired: 'expired' }
  return <span className={`badge badge-${map[status] || 'inactive'}`}>{status}</span>
}

export default function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status') || ''
  const filterParam = searchParams.get('filter') || ''

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(statusParam || filterParam)
  const [page, setPage] = useState(1)
  const [freezeMembership] = useFreezeMembershipMutation()

  useEffect(() => {
    setStatusFilter(statusParam || filterParam)
    setPage(1)
  }, [statusParam, filterParam])

  const { data, isLoading } = useGetMembersQuery({
    search,
    status: statusFilter,
    filter: filterParam,
    page,
    limit: 15,
  })
  const members = data?.data || []
  const pagination = data?.pagination || {}

  const handleFreeze = async (id) => {
    try {
      await freezeMembership(id).unwrap()
      toast.success('Membership frozen')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to freeze')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{pagination.total || 0} total members</p>
        </div>
        <Link to="/members/new" id="add-member-btn">
          <button className="btn btn-primary">
            <Plus size={16} /> Add Member
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search name, phone, ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            id="member-search"
          />
        </div>
        <select
          className="input"
          style={{ width: 'auto', minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => {
            const val = e.target.value
            setStatusFilter(val)
            if (val === 'newThisMonth') {
              setSearchParams({ filter: 'newThisMonth' })
            } else if (val) {
              setSearchParams({ status: val })
            } else {
              setSearchParams({})
            }
            setPage(1)
          }}
          id="member-status-filter"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="newThisMonth">New This Month</option>
          <option value="frozen">Frozen</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading members...</div>
          ) : members.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              {statusFilter === 'inactive'
                ? 'No inactive members found'
                : statusFilter === 'newThisMonth' || filterParam === 'newThisMonth'
                ? 'No new members found this month'
                : 'No members found.'}{' '}
              <Link to="/members/new" style={{ color: 'var(--color-accent)' }}>Add member.</Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>ID</th>
                  <th>Phone</th>
                  <th>Plan</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <motion.tr key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar">
                          {m.photo ? (
                            <img src={m.photo} alt={m.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : m.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>{m.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{m.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-accent-light)' }}>{m.memberId}</span></td>
                    <td>{m.phone}</td>
                    <td>{m.currentPlanId?.name || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                    <td>{m.joinDate ? format(new Date(m.joinDate), 'dd MMM yyyy') : '—'}</td>
                    <td>{statusBadge(m.membershipStatus)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <Link to={`/members/${m._id}`}>
                          <button className="btn btn-ghost" style={{ padding: '0.375rem' }} title="View"><Eye size={15} /></button>
                        </Link>
                        <Link to={`/members/${m._id}/edit`}>
                          <button className="btn btn-ghost" style={{ padding: '0.375rem' }} title="Edit"><Edit size={15} /></button>
                        </Link>
                        {m.membershipStatus === 'active' && (
                          <button className="btn btn-ghost" style={{ padding: '0.375rem', color: 'var(--color-info)' }} title="Freeze" onClick={() => handleFreeze(m._id)}>
                            <Snowflake size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--color-bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} records)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Prev</button>
              <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
