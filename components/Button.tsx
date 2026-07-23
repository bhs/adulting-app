import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  // min-h-[48px] keeps every button a thumb-friendly tap target on mobile
  // (WCAG 2.5.5); active:scale gives a subtle press response, and the disabled
  // styles make an unavailable action read clearly rather than silently ignore.
  const baseClasses =
    'inline-flex items-center justify-center min-h-[48px] px-4 py-2 rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
