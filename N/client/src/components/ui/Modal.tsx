import React, { useEffect, useCallback } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  full: 'max-w-5xl',
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  children,
  footer,
}) => {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose()
      }
    },
    [closeOnEsc, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEsc])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-200 scale-100 flex flex-col max-h-[90vh]`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
