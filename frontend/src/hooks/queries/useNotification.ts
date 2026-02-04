import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventSourcePolyfill } from 'event-source-polyfill';

import { fetchNotifications, readNotification } from '@/api/notification.api';
import { useAuthStore } from '@/store/useAuthStore';

import type { Notification } from '@/types/notification.types';

export const useNotification = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  // 1. 초기 알림 목록 로드 (일반 API 요청) + 폴링 (3초마다 자동 갱신)
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!token,
    refetchInterval: 3000, // 3초마다 폴링으로 알림 확인 (SSE 실패 대비)
  });

  // 2. SSE 연결 및 실시간 업데이트
  useEffect(() => {
    if (!token) return;

    const eventSource = new EventSourcePolyfill('/api/notification/subscribe', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatTimeout: 86400000, // 연결 유지 시간 설정 (필요시 조정)
    });

    eventSource.onopen = () => {
      console.log('✅ SSE Connected');
    };

    // 이벤트 핸들러 공통화
    const handleMessage = (event: MessageEvent) => {
      try {
        const newNotification = JSON.parse(event.data) as Notification;

        // 캐시 업데이트: 새 알림을 리스트 맨 앞에 추가
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

        // 쿼리 무효화로 강제 리페치 (데이터 동기화 확실히 하기 위해)
        // queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    // 기본 메시지 수신
    eventSource.onmessage = handleMessage;

    // 'notification' 이름의 이벤트 수신
    eventSource.addEventListener(
      'notification',
      handleMessage as EventListener,
    );

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      console.log('🔌 SSE Disconnected');
      eventSource.removeEventListener(
        'notification',
        handleMessage as EventListener,
      );
      eventSource.close();
    };
  }, [token, queryClient]);

  // 읽지 않은 알림 개수 계산
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 3. 알림 읽음 처리 Mutation
  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId: string) => readNotification(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) => {
        if (!old) return [];
        return old.map((n) =>
          n.notificationId === notificationId ? { ...n, read: true } : n,
        );
      });
    },
  });

  return { notifications, unreadCount, markAsRead };
};
