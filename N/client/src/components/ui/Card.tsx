import React from 'react'

export interface CardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  hoverable?: boolean
  onClick?: () => void
}

const variantClasses: Record<string, string> = {
  default: 'bg-white border border-gray-200',
  outlined: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-100',
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'md',
  className = '',
  headerAction,
  footer,
  hoverable = false,
  onClick,
}) => {
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hoverable ? 'hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        rounded-xl
        ${className}
      `}
      onClick={onClick}
    >
      {(title || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="text-gray-700">{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-gray-100">{footer}</div>}
    </div>
  )
}

export default Card
