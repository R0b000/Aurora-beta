import React, { createContext, useContext, useState, useCallback } from 'react'

export type ToastType = 'success' | 'warning' | 'danger' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  danger: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const variantConfig: Record<ToastType, { bg: string; icon: React.ReactNode; border: string }> = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: (
      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    border: 'border-l-4 border-l-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    icon: (
      <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    border: 'border-l-4 border-l-yellow-500',
  },
  danger: {
    bg: 'bg-red-50 border-red-200',
    icon: (
      <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    border: 'border-l-4 border-l-red-500',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: (
      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    border: 'border-l-4 border-l-blue-500',
  },
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, type, message, duration }])
      setTimeout(() => removeToast(id), duration)
    },
    [removeToast]
  )

  const success = useCallback((message: string, duration?: number) => showToast('success', message, duration), [showToast])
  const warning = useCallback((message: string, duration?: number) => showToast('warning', message, duration), [showToast])
  const danger = useCallback((message: string, duration?: number) => showToast('danger', message, duration), [showToast])
  const info = useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, warning, danger, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          const config = variantConfig[toast.type]
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border
                ${config.bg} ${config.border}
                transform transition-all duration-300 animate-slide-in
                max-w-sm w-full
              `}
            >
              <span className="flex-shrink-0 mt-0.5">{config.icon}</span>
              <p className="text-sm text-gray-800 font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default ToastProvider
