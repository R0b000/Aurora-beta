import React, { useState, useRef, useEffect } from 'react'

export interface Message {
  _id: string
  sender: { name: string; avatar?: string; role: string }
  receiver: { name: string; avatar?: string; role: string }
  text: string
  timestamp: string
  read: boolean
  attachment?: { url: string; type: string; name: string }
}

export interface MessageDropdownProps {
  messages: Message[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDelete: (id: string) => void
  onReply?: (message: Message) => void
  onOpenThread?: (message: Message) => void
  renderTrigger?: React.ReactNode
  maxHeight?: number
  emptyMessage?: string
}

const MessageDropdown: React.FC<MessageDropdownProps> = ({
  messages,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onReply,
  onOpenThread,
  renderTrigger,
  maxHeight = 320,
  emptyMessage = 'No messages',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const unreadCount = messages.filter((m) => !m.read).length

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        {renderTrigger || (
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all origin-top-right">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Messages</h3>
              {messages.some((m) => !m.read) && (
                <button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">{emptyMessage}</div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`
                      flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50
                      ${!msg.read ? 'bg-blue-50/40 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                    `}
                    onClick={() => { onMarkRead(msg._id); onOpenThread?.(msg); setIsOpen(false); }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {msg.sender.avatar ? (
                        <img src={msg.sender.avatar} alt={msg.sender.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">{msg.sender.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm font-semibold truncate ${!msg.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {msg.sender.name}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${!msg.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {msg.text}
                      </p>
                      {msg.attachment && (
                        <p className="text-[10px] text-blue-500 mt-0.5 truncate">
                          Attachment: {msg.attachment.name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); onReply?.(msg); }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Reply"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(msg._id); }}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MessageDropdown
