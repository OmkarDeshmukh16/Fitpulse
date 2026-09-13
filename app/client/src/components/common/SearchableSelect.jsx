import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, X, Check } from 'lucide-react'

/**
 * SearchableSelect - Reusable searchable dropdown combobox component
 *
 * Props:
 * @param {Array<string|{value: string, label: string, sublabel?: string, badge?: string, icon?: any}>} options
 * @param {string} value - Currently selected value
 * @param {function} onChange - Callback (value, selectedOption) => void
 * @param {string} placeholder - Placeholder text
 * @param {string} searchPlaceholder - Placeholder for the search input
 * @param {boolean} disabled - Whether select is disabled
 * @param {boolean} isClearable - Allow clearing selection
 * @param {string} id - HTML ID for accessibility/testing
 * @param {string} className - Optional container className
 * @param {object} style - Optional container inline styles
 */
export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Type to search...',
  disabled = false,
  isClearable = false,
  id,
  className = '',
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Normalize options array
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value ?? opt.id ?? '',
        label: opt.label ?? opt.name ?? String(opt.value ?? ''),
        sublabel: opt.sublabel || '',
        badge: opt.badge || '',
        icon: opt.icon || null,
      }
    }
    return {
      value: String(opt),
      label: String(opt),
      sublabel: '',
      badge: '',
      icon: null,
    }
  })

  // Selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Filtered options based on search query
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const matchLabel = opt.label.toLowerCase().includes(q)
    const matchSublabel = opt.sublabel ? opt.sublabel.toLowerCase().includes(q) : false
    const matchValue = opt.value ? opt.value.toLowerCase().includes(q) : false
    return matchLabel || matchSublabel || matchValue
  })

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  const handleSelect = (opt) => {
    if (onChange) onChange(opt.value, opt)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (onChange) onChange('', null)
    setSearch('')
  }

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {/* Trigger Button */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            setIsOpen(true)
          } else if (e.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          background: 'var(--color-bg-secondary)',
          border: isOpen ? '1px solid var(--color-accent)' : '1px solid var(--color-bg-border)',
          borderRadius: 'var(--radius-md)',
          color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          fontSize: '0.875rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          boxShadow: isOpen ? '0 0 15px rgba(99,102,241,0.2)' : 'none',
          transition: 'all 0.2s',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          {selectedOption?.icon && (
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {selectedOption.icon}
            </span>
          )}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, marginLeft: '0.5rem' }}>
          {isClearable && selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: 2,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Clear selection"
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown
            size={16}
            color="var(--color-text-muted)"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 90,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-bg-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 280,
            }}
          >
            {/* Search Input */}
            <div
              style={{
                padding: '0.5rem',
                borderBottom: '1px solid var(--color-bg-border)',
                background: 'var(--color-bg-secondary)',
                position: 'relative',
              }}
            >
              <Search
                size={14}
                color="var(--color-text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem 0.4rem 2rem',
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-bg-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Options List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0.25rem 0' }}>
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.8rem',
                  }}
                >
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
                      style={{
                        padding: '0.6rem 0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: isSelected ? '#818cf8' : 'var(--color-text-primary)',
                        fontSize: '0.85rem',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-hover)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        {opt.icon && <span style={{ flexShrink: 0 }}>{opt.icon}</span>}
                        <span style={{ fontWeight: isSelected ? 600 : 400 }}>{opt.label}</span>
                        {opt.sublabel && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {opt.sublabel}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {opt.badge && (
                          <span className={`badge ${opt.badge}`} style={{ fontSize: '0.65rem' }}>
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} color="#818cf8" />}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
