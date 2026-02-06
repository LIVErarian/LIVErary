import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { fetchNotifications, readNotification } from '@/api/notification.api';
import { useAuthStore } from '@/store/useAuthStore';

import type { Notification } from '@/types/notification.types';

export const useNotification = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  // 1. 초기 알림 목록 로드 (일반 API 요청)
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지 (읽음 처리 후 바로 사라짐 방지)
    gcTime: 10 * 60 * 1000,
  });

  // 2. SSE 연결 및 실시간 업데이트
  useEffect(() => {
    console.log('🔄 Init SSE Connection. Token exists:', !!token);
    if (!token) return;

    const eventSource = new EventSourcePolyfill('/api/notification/subscribe', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatTimeout: 86400000,
      withCredentials: true,
    });

    eventSource.onopen = (e) => {
      console.log('✅ SSE Connected (onopen)', e);
    };

    const handleMessage = (event: MessageEvent) => {
      console.log('📨 SSE Received (Any):', event.data, 'Type:', event.type);

      // EventStream Created 메시지 무시
      if (
        typeof event.data === 'string' &&
        event.data.includes('EventStream Created')
      ) {
        console.log('✅ SSE Connection confirmed by server');
        return;
      }

      try {
        const newNotification = JSON.parse(event.data) as Notification;
        console.log('🔔 Parsed Notification:', newNotification);

        queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
          const currentList = old || [];
          if (
            currentList.some(
              (n) => n.notificationId === newNotification.notificationId,
            )
          ) {
            return currentList;
          }
          return [newNotification, ...currentList];
        });
      } catch (error) {
        console.error(error);
      }
    };

    // 기본 메시지 수신 (이름 없는 이벤트)
    eventSource.onmessage = handleMessage;

    // 'sse' 이름의 이벤트 수신
    eventSource.addEventListener('sse', handleMessage as EventListener);

    // 'connect' 이름의 이벤트 수신 (초기 연결 확인용)
    eventSource.addEventListener('connect', ((e: MessageEvent) => {
      console.log('🔗 SSE Connect Event:', e.data);
    }) as EventListener);

    eventSource.onerror = (error) => {
      console.error('❌ SSE Error:', error);
      // @ts-expect-error: error type check
      if (error?.status === 401) {
        console.error('SSE 401 Unauthorized, closing connection');
        eventSource.close();
      }
    };

    return () => {
      console.log('🔌 SSE Disconnected');
      eventSource.removeEventListener('sse', handleMessage as EventListener);
      eventSource.close();
    };
  }, [token, queryClient]);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 3. 알림 읽음 처리 Mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId: string) => readNotification(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!old) return [];
        return old.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n,
        );
      });
    },
  });

  return { notifications, unreadCount, markAsRead };
};
