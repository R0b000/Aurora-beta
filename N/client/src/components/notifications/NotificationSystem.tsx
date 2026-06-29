import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { useToast } from '../ui/Toaster'
import { useNavigate } from 'react-router-dom'

export interface Notification {
  _id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

export interface NotificationSystemProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDelete: (id: string) => void
  children: React.ReactNode
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  children,
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <NotificationDropdown
            notifications={notifications}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onDelete={onDelete}
            onClose={() => setShowDropdown(false)}
            renderTrigger={children as React.ReactNode}
          />
        </>
      )}
    </div>
  )
}

interface NotificationDropdownProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDelete: (id: string) => void
  onClose: () => void
  renderTrigger: React.ReactNode
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClose: _onClose,
}) => {
  const typeStyles: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }

  const typeIcons: Record<string, React.ReactNode> = {
    info: <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    success: <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    warning: <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
    error: <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`
                flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors
                ${typeStyles[n.type] || 'bg-white'}
                ${!n.read ? 'border-l-4' : ''}
                hover:bg-gray-50
              `}
              onClick={() => onMarkRead(n._id)}
            >
              <div className="flex-shrink-0 mt-0.5">{typeIcons[n.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(n._id); }}
                className="flex-shrink-0 text-gray-300 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationSystem
