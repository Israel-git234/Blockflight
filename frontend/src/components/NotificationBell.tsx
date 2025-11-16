import React, { useMemo, useState } from 'react'
import { useNotifications } from './NotificationsProvider'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotifications()
  const [open, setOpen] = useState(false)

  const styles = {
    container: {
      position: 'relative' as const
    },
    bellButton: {
      position: 'relative' as const,
      background: 'rgba(168,85,247,0.2)',
      border: '1px solid rgba(168,85,247,0.35)',
      color: 'white',
      borderRadius: '0.75rem',
      padding: '0.5rem 0.75rem',
      cursor: 'pointer'
    },
    badge: {
      position: 'absolute' as const,
      top: -6,
      right: -6,
      background: '#ef4444',
      color: 'white',
      borderRadius: '9999px',
      padding: '0 6px',
      fontSize: '0.75rem',
      fontWeight: 'bold' as const
    },
    popover: {
      position: 'absolute' as const,
      top: '120%',
      right: 0,
      width: 360,
      maxHeight: 420,
      overflowY: 'auto' as const,
      background: 'rgba(2,6,23,0.95)',
      border: '1px solid rgba(168,85,247,0.35)',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
      zIndex: 200
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid rgba(168,85,247,0.2)'
    },
    list: {
      padding: '0.5rem'
    },
    item: {
      border: '1px solid rgba(168,85,247,0.25)',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '0.75rem',
      padding: '0.75rem',
      marginBottom: '0.5rem'
    },
    title: {
      fontWeight: 'bold' as const,
      marginBottom: '0.25rem'
    },
    small: {
      fontSize: '0.75rem',
      color: '#a78bfa'
    }
  }

  return (
    <div style={styles.container}>
      <button style={styles.bellButton} onClick={() => setOpen(o => !o)}>
        🔔 Notifications
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
      </button>
      {open && (
        <div style={styles.popover}>
          <div style={styles.header}>
            <div style={{ fontWeight: 'bold' }}>Notifications</div>
            <button onClick={markAllAsRead} style={{ background: 'transparent', border: 'none', color: '#a78bfa', cursor: 'pointer' }}>Mark all as read</button>
          </div>
          <div style={styles.list}>
            {notifications.length === 0 && (
              <div style={{ padding: '1rem', color: '#9ca3af' }}>No notifications</div>
            )}
            {notifications.map(n => (
              <div key={n.id} style={styles.item}>
                <div style={styles.title}>{n.title}</div>
                {n.message && <div style={{ color: '#e5e7eb' }}>{n.message}</div>}
                <div style={styles.small}>{new Date(n.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => removeNotification(n.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


