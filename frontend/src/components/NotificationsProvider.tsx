import React, { createContext, useContext, useMemo, useState, useCallback, ReactNode, useEffect } from 'react'

export interface AppNotification {
  id: string
  title: string
  message?: string
  createdAt: number
  read?: boolean
  tag?: string
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem('bf_notifications')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('bf_notifications', JSON.stringify(notifications)) } catch {}
  }, [notifications])

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    setNotifications(prev => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      read: false,
      ...n
    }, ...prev].slice(0, 100))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const value = useMemo(() => ({ notifications, unreadCount, addNotification, markAllAsRead, removeNotification }), [notifications, unreadCount, addNotification, markAllAsRead, removeNotification])

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}


