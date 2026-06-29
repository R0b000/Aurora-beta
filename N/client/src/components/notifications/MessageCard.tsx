import React from 'react'

export interface Message {
  _id: string
  sender: { name: string; avatar?: string; role: string }
  receiver: { name: string; avatar?: string; role: string }
  text: string
  timestamp: string
  read: boolean
  attachment?: { url: string; type: string; name: string }
}

export interface MessageCardProps {
  message: Message
  isOwn?: boolean
  showSender?: boolean
  onAttachmentClick?: (url: string) => void
  className?: string
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  isOwn = false,
  showSender = true,
  onAttachmentClick,
  className = '',
}) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`flex gap-3 max-w-[70%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {showSender && !isOwn && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {message.sender.avatar ? (
              <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-gray-500">{message.sender.name[0]}</span>
            )}
          </div>
        )}
        <div>
          {showSender && !isOwn && (
            <p className="text-xs text-gray-500 font-medium mb-1 ml-1">{message.sender.name}</p>
          )}
          <div
            className={`
              px-4 py-2.5 rounded-2xl text-sm leading-relaxed
              ${isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'}
            `}
          >
            <p>{message.text}</p>
            {message.attachment && (
              <div
                onClick={() => onAttachmentClick?.(message.attachment!.url)}
                className="mt-2 p-2 rounded-lg bg-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="text-xs truncate">{message.attachment.name}</span>
              </div>
            )}
          </div>
          <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
            {time}
            {isOwn && !message.read && <span className="ml-1 text-blue-500">✓✓</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageCard
