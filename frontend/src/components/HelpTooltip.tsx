import React, { useState } from 'react'

interface HelpTooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Tooltip component that shows help information on hover
 */
export function HelpTooltip({ 
  content, 
  children, 
  position = 'top' 
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionStyles = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            ...positionStyles[position],
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            border: '1px solid rgba(124, 58, 237, 0.5)',
            maxWidth: '250px',
            whiteSpace: 'normal',
            lineHeight: '1.4'
          }}
        >
          {content}
          <div
            style={{
              position: 'absolute',
              ...(position === 'top' ? { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTop: '6px solid rgba(0, 0, 0, 0.9)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' } :
                position === 'bottom' ? { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottom: '6px solid rgba(0, 0, 0, 0.9)', borderLeft: '6px solid transparent', borderRight: '6px solid transparent' } :
                position === 'left' ? { left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeft: '6px solid rgba(0, 0, 0, 0.9)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' } :
                { right: '100%', top: '50%', transform: 'translateY(-50%)', borderRight: '6px solid rgba(0, 0, 0, 0.9)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent' })
            }}
          />
        </div>
      )}
    </div>
  )
}


