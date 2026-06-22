import React from 'react'

interface CardProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600 text-sm mb-4">{description}</p>}
      {children}
    </div>
  )
}
