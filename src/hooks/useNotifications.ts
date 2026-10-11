'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useNotificationSocket, RawNotification } from '@/lib/notifications-socket';

export interface NotificationItem {
  id: number;
  type: string;
  message: string;
  entityType?: string;
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await apiFetch('/notifications/mine/count');
      if (!res.ok) return;
      const data: number = await res.json();
      setUnreadCount(data);
    } catch (err) {
      console.error('Notification count fetch error:', err);
    }
  }, []);

  const fetchList = useCallback(async () => {
    try {
      const res = await apiFetch('/notifications/mine?unread=true');
      if (!res.ok) return;
      const data: NotificationItem[] = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Notification list fetch error:', err);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      const res = await apiFetch(`/notifications/read/${id}`, { method: 'PATCH' });
      if (!res.ok) return;
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, []);

  // Faqat lokal state'dan olib tashlaydi (dropdown ro'yxatidan yo'qolishi uchun) —
  // o'qilgan-o'qilmaganligi allaqachon markAsRead orqali backendga yozilgan bo'ladi.
  const removeFromList = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await apiFetch('/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) return;
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all as read error:', err);
    }
  }, []);

  // Real-vaqt: yangi notification kelganda darhol counter va ro'yxatni yangilaymiz —
  // API'ga qayta so'rov yuborishning hojati yo'q, kelgan ma'lumotning o'zi yetarli.
  const handleIncomingNotification = useCallback((notif: RawNotification) => {
    setUnreadCount((c) => c + 1);
    setItems((prev) => {
      if (prev.some((n) => n.id === notif.id)) return prev; // takrorlanishning oldini olamiz
      return [notif as NotificationItem, ...prev];
    });
  }, []);

  const { connected } = useNotificationSocket(handleIncomingNotification);

  useEffect(() => {
    fetchCount();
    // Socket asosiy manba — polling faqat backup sifatida, socket uzilib qolsa ham
    // counter uzoq muddatda eskirmasin degan maqsadda, ancha kamroq tez-tez ishlaydi.
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { items, unreadCount, fetchList, markAsRead, markAllAsRead, removeFromList, connected };
}