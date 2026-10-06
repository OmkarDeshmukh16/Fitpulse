import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Send,
  Download,
  Mail,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Users,
  Eye,
  Gift,
  Tag,
  Flame,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

const OFFER_TEMPLATES = [
  {
    id: 'discount_20',
    name: '20% OFF Renewal',
    icon: Tag,
    title: 'Special 20% OFF Comeback Offer!',
    message:
      'Hey {name}! 💪 We miss having you train with us at {gymName}! Renew your gym membership this week and get an exclusive 20% discount on any plan. Visit our front desk or reply to this message to claim your offer! 🔥',
  },
  {
    id: 'free_month',
    name: '1 Month FREE Extension',
    icon: Gift,
    title: 'Exclusive: Get 1 Month FREE at {gymName}',
    message:
      'Hi {name}! 🏋️‍♂️ Ready to restart your fitness journey? Renew your plan today at {gymName} and get 1 extra month completely FREE! Let\'s crush your fitness goals together! 💥',
  },
  {
    id: 'flat_500',
    name: 'Flat ₹500 Voucher',
    icon: Flame,
    title: '₹500 Comeback Voucher for You',
    message:
      'Hello {name}! We have credited a special ₹500 renewal voucher to your {gymName} account. Valid for renewals within the next 7 days. Reply to lock in your discount! 🚀',
  },
  {
    id: 'free_pt',
    name: 'Free Personal Training',
    icon: Sparkles,
    title: 'Restart with 2 Free Personal Training Sessions!',
    message:
      'Hey {name}! We\'d love to help you restart your fitness journey. Reactivate your {gymName} membership this week and receive 2 complimentary 1-on-1 Personal Training sessions + Zero rejoin fees! 🙌',
  },
  {
    id: 'custom',
    name: 'Custom Offer',
    icon: MessageSquare,
    title: 'Special Offer from {gymName}',
    message:
      'Hey {name}, we have a special limited-time offer for you at {gymName}. Visit us or reply to this message to know more!',
  },
]

export const cleanPhoneNumber = (phone) => {
  if (!phone) return ''
  let digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10) {
    digits = `91${digits}`
  }
  return digits
}

export const formatMessage = (template, member, gymName = 'Fitpulse') => {
  if (!template) return ''
  return template
    .replace(/\{name\}/gi, member?.fullName || 'Member')
    .replace(/\{gymName\}/gi, gymName || 'Fitpulse')
    .replace(/\{planName\}/gi, member?.currentPlanId?.name || 'Membership')
    .replace(/\{phone\}/gi, member?.phone || '')
}

export default function LostMembersOfferModal({
  isOpen,
  onClose,
  selectedMembers = [],
  gymSettings = {},
  onSendEmailCampaign,
  isSendingCampaign = false,
}) {
  const gymName = gymSettings?.gymName || 'Fitpulse'
  const [selectedTemplateId, setSelectedTemplateId] = useState('discount_20')
  const [offerTitle, setOfferTitle] = useState(OFFER_TEMPLATES[0].title)
  const [messageBody, setMessageBody] = useState(OFFER_TEMPLATES[0].message)
  const [activeChannel, setActiveChannel] = useState('whatsapp') // 'whatsapp' | 'sms' | 'email' | 'export'
  const [copiedType, setCopiedType] = useState(null)
  const [sentWhatsappIds, setSentWhatsappIds] = useState({})

  if (!isOpen) return null

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id)
    setOfferTitle(tpl.title)
    setMessageBody(tpl.message)
  }

  const insertVariable = (variable) => {
    setMessageBody((prev) => `${prev} ${variable}`)
  }

  const sampleMember = selectedMembers[0] || {
    fullName: 'Rahul Sharma',
    phone: '9876543210',
    currentPlanId: { name: 'Monthly Gold' },
  }
  const previewText = formatMessage(messageBody, sampleMember, gymName)

  const handleOpenWhatsApp = (member) => {
    const phone = cleanPhoneNumber(member.phone)
    if (!phone) {
      toast.error(`Invalid phone number for ${member.fullName}`)
      return
    }
    const personalizedText = formatMessage(messageBody, member, gymName)
    const encoded = encodeURIComponent(personalizedText)
    const waUrl = `https://wa.me/${phone}?text=${encoded}`
    window.open(waUrl, '_blank')
    setSentWhatsappIds((prev) => ({ ...prev, [member._id]: true }))
  }

  const handleOpenSMS = (member) => {
    const phone = member.phone || ''
    const personalizedText = formatMessage(messageBody, member, gymName)
    const encoded = encodeURIComponent(personalizedText)
    window.open(`sms:${phone}?body=${encoded}`, '_self')
  }

  const handleCopyNumbers = (delimiter = ', ') => {
    const numbers = selectedMembers
      .map((m) => m.phone?.trim())
      .filter(Boolean)
      .join(delimiter)
    if (!numbers) {
      toast.error('No phone numbers available to copy')
      return
    }
    navigator.clipboard.writeText(numbers)
    setCopiedType('numbers')
    toast.success(`Copied ${selectedMembers.length} phone numbers!`)
    setTimeout(() => setCopiedType(null), 2500)
  }

  const handleCopyFormattedBroadcast = () => {
    const text = selectedMembers
      .map((m) => {
        const phone = cleanPhoneNumber(m.phone)
        const msg = formatMessage(messageBody, m, gymName)
        return `Recipient: ${m.fullName} (+${phone})\nMessage:\n${msg}\n${'-'.repeat(30)}`
      })
      .join('\n\n')

    navigator.clipboard.writeText(text)
    setCopiedType('broadcast')
    toast.success('Copied all personalized messages to clipboard!')
    setTimeout(() => setCopiedType(null), 2500)
  }

  const handleExportCSV = () => {
    if (!selectedMembers.length) {
      toast.error('No members selected')
      return
    }
    const headers = ['Member Name', 'Phone Number', 'WhatsApp Number', 'Email', 'Last Plan', 'Offer Title', 'Offer Message']
    const rows = selectedMembers.map((m) => {
      const cleanPhone = cleanPhoneNumber(m.phone)
      const msg = formatMessage(messageBody, m, gymName).replace(/"/g, '""')
      return [
        `"${m.fullName || ''}"`,
        `"${m.phone || ''}"`,
        `"${cleanPhone}"`,
        `"${m.email || ''}"`,
        `"${m.currentPlanId?.name || 'N/A'}"`,
        `"${offerTitle.replace(/"/g, '""')}"`,
        `"${msg}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `re-engagement-campaign-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported campaign CSV for bulk messaging tools!')
  }

  const validEmailMembers = selectedMembers.filter((m) => m.email && m.email.includes('@'))

  const handleTriggerEmailCampaign = async () => {
    if (!onSendEmailCampaign) return
    try {
      await onSendEmailCampaign({
        memberIds: selectedMembers.map((m) => m._id),
        offerTitle,
        message: messageBody,
        sendEmailToAvailable: true,
      })
      toast.success(`Email campaign dispatched to ${validEmailMembers.length} members with email!`)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to dispatch email campaign')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, overflowY: 'auto', padding: '1.5rem 1rem' }}>
      <div
        className="modal slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-bg-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <MessageCircle size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                Reactivate Lost Members
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Send promotional offers via WhatsApp, SMS, or Email to win them back.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: 20,
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--color-accent-light, #818cf8)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <Users size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              {selectedMembers.length} Selected
            </span>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', borderRadius: 8 }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          {/* Preset Offers Bar */}
          <div>
            <label className="label" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="#f59e0b" /> Select Offer Preset:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
              {OFFER_TEMPLATES.map((tpl) => {
                const IconComponent = tpl.icon
                const isSelected = selectedTemplateId === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 8,
                      border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-bg-border)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--color-bg-secondary)',
                      color: isSelected ? 'var(--color-accent-light, #818cf8)' : 'var(--color-text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={14} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Campaign Title & Message Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="label">Campaign Title / Email Subject</label>
              <input
                className="input"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="e.g. Special Comeback Offer for You!"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="label" style={{ margin: 0 }}>
                  Offer Message (Supports Variables)
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginRight: 2, alignSelf: 'center' }}>
                    Insert Tag:
                  </span>
                  {[
                    { tag: '{name}', label: 'Name' },
                    { tag: '{gymName}', label: 'Gym' },
                    { tag: '{planName}', label: 'Plan' },
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      style={{
                        padding: '0.2rem 0.45rem',
                        fontSize: '0.7rem',
                        background: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-bg-border)',
                        borderRadius: 4,
                        color: 'var(--color-accent-light)',
                        cursor: 'pointer',
                      }}
                    >
                      +{v.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="input"
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Type your message with {name} and {gymName}..."
                style={{ resize: 'vertical', fontSize: '0.875rem', lineHeight: '1.45' }}
              />
            </div>
          </div>

          {/* Dynamic Live Preview Box */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--color-bg-border)',
              borderRadius: 10,
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <Eye size={13} /> LIVE PREVIEW (for {sampleMember.fullName}):
            </div>
            <p style={{ margin: 0, color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {previewText}
            </p>
          </div>

          {/* Channels Selector Navigation */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid var(--color-bg-border)',
                paddingBottom: '0.5rem',
              }}
            >
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#10b981' },
                { id: 'sms', label: 'SMS / Text', icon: MessageSquare, color: '#3b82f6' },
                { id: 'email', label: `Email (${validEmailMembers.length})`, icon: Mail, color: '#8b5cf6' },
                { id: 'export', label: 'Export for Bulk Tools', icon: Download, color: '#f59e0b' },
              ].map((c) => {
                const IconComponent = c.icon
                const isActive = activeChannel === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveChannel(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 8,
                      border: 'none',
                      background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
                      color: isActive ? c.color : 'var(--color-text-muted)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderBottom: isActive ? `2px solid ${c.color}` : '2px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComponent size={15} />
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Channel Details */}
          {activeChannel === 'whatsapp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                  Click <strong>Send WhatsApp</strong> for each recipient to open WhatsApp Web/App pre-filled with this message.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => handleCopyNumbers(',')}
                  >
                    {copiedType === 'numbers' ? <Check size={13} color="#10b981" /> : <Copy size={13} />} Copy Phone Numbers
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={handleCopyFormattedBroadcast}
                  >
                    {copiedType === 'broadcast' ? <Check size={13} color="#10b981" /> : <Copy size={13} />} Copy All Messages
                  </button>
                </div>
              </div>

              {/* Members Queue Table */}
              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-bg-border)',
                  borderRadius: 8,
                  background: 'var(--color-bg-primary)',
                }}
              >
                <table style={{ width: '100%', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-bg-border)', background: 'var(--color-bg-secondary)' }}>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Member</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Phone</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Last Plan</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMembers.map((m) => {
                      const isSent = sentWhatsappIds[m._id]
                      return (
                        <tr key={m._id} style={{ borderBottom: '1px solid var(--color-bg-border)' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {m.fullName}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-muted)' }}>{m.phone}</td>
                          <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-secondary)' }}>
                            {m.currentPlanId?.name || '—'}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenWhatsApp(m)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: 6,
                                background: isSent ? 'rgba(16, 185, 129, 0.15)' : '#10b981',
                                color: isSent ? '#10b981' : '#ffffff',
                                border: isSent ? '1px solid #10b981' : 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {isSent ? <CheckCircle size={12} /> : <MessageCircle size={12} />}
                              {isSent ? 'Sent' : 'Send WhatsApp'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeChannel === 'sms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Send personalized offers via SMS or copy numbers to paste into your SMS gateway (Twilio, MSG91, Fast2SMS).
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenSMS(sampleMember)}
                >
                  <MessageSquare size={15} /> Open Native SMS (Single Member)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleCopyNumbers(',')}
                >
                  {copiedType === 'numbers' ? <Check size={14} color="#10b981" /> : <Copy size={14} />} Copy Comma-Separated Numbers ({selectedMembers.length})
                </button>
              </div>
            </div>
          )}

          {activeChannel === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 8,
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-bg-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={16} color="#8b5cf6" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    Email Campaign Dispatch
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  {validEmailMembers.length} out of {selectedMembers.length} selected members have an email on file.
                  Each recipient will receive a styled email with the subject <strong>"{offerTitle}"</strong> and their personalized offer.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={isSendingCampaign || validEmailMembers.length === 0}
                onClick={handleTriggerEmailCampaign}
                style={{ alignSelf: 'flex-start' }}
              >
                {isSendingCampaign ? (
                  <>
                    <RefreshCw size={15} className="spin" /> Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Email to {validEmailMembers.length} Members
                  </>
                )}
              </button>
            </div>
          )}

          {activeChannel === 'export' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Download an export file containing all recipient contact information and their personalized offer messages. Compatible with WhatsApp broadcast upload tools, CRM imports, and bulk SMS dashboards.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleExportCSV}
                style={{ alignSelf: 'flex-start' }}
              >
                <Download size={15} /> Download Campaign CSV ({selectedMembers.length} Rows)
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-bg-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            💡 Tip: WhatsApp links open WhatsApp Web or the WhatsApp desktop application directly.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Done / Close
          </button>
        </div>
      </div>
    </div>
  )
}
