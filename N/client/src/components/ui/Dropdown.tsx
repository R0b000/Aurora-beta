import React, { useState, useRef, useEffect } from 'react'

export interface DropdownOption {
  value: string | number
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  badge?: string | number
}

export interface DropdownProps {
  options: DropdownOption[]
  value?: string | number | (string | number)[]
  placeholder?: string
  onChange?: (value: string | number | (string | number)[]) => void
  multiple?: boolean
  searchable?: boolean
  disabled?: boolean
  className?: string
  label?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select...',
  onChange,
  multiple = false,
  searchable = false,
  disabled = false,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = searchQuery
    ? options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  const isSelected = (optValue: string | number) => {
    if (!value) return false
    if (Array.isArray(value)) return value.includes(optValue)
    return value === optValue
  }

  const handleSelect = (optValue: string | number) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : []
      const next = current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue]
      onChange?.(next)
    } else {
      onChange?.(optValue)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const selectedLabels = () => {
    if (!value) return placeholder
    if (Array.isArray(value)) {
      if (value.length === 0) return placeholder
      return value.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean).join(', ')
    }
    return options.find((o) => o.value === value)?.label || placeholder
  }

  return (
    <div className={`w-full ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-lg
            text-sm transition-all duration-200
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
          `}
        >
          <span className={`truncate ${!value || (Array.isArray(value) && value.length === 0) ? 'text-gray-400' : 'text-gray-900'}`}>
            {selectedLabels()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-400 text-center">No options found</p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                      ${isSelected(option.value) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                      ${option.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                      {option.label}
                    </span>
                    <span className="flex items-center gap-2">
                      {option.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {option.badge}
                        </span>
                      )}
                      {isSelected(option.value) && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dropdown
