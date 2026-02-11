import {
  Client,
  type StompHeaders,
  type StompSubscription,
} from '@stomp/stompjs';
import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';

import type {
  LeaveRoomRequest,
  MoveBroadcast,
  MoveEnterRequest,
  MoveExitRequest,
  MoveRequest,
} from '@/types/socket/socket.types';

interface SocketState {
  client: Client | null;
  isConnected: boolean;
  moveSubscription: StompSubscription | null;
  subscribedFloorId: string | null;

  // 소켓 연결 / 해제
  connect: () => void;
  disconnect: () => void;

  // 층 입장 및 구독
  subscribeMove: (
    floorId: string,
    onMoveReceive: (moves: MoveBroadcast[]) => void,
  ) => void;
  // exit 대상 floorId를 외부에서 지정할 수 있게 확장
  unsubscribeMove: (options?: {
    sendExit?: boolean;
    exitFloorId?: string;
  }) => void;

  sendEnter: (req: MoveEnterRequest) => void;
  sendMove: (req: MoveRequest) => void;
  sendExit: (req: MoveExitRequest) => void;
  sendLeaveRoom: (req: LeaveRoomRequest) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// 최신 토큰으로 헤더 만들기
export const getHeaders = (): StompHeaders => {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useSocketStore = create<SocketState>((set, get) => ({
  client: null,
  isConnected: false,
  moveSubscription: null,
  subscribedFloorId: null,

  connect: async () => {
    const state = get();

    // 이미 연결 중이거나 연결된 클라이언트가 있다면 실행하지 않음
    if (state.client?.active || state.client?.connected) {
      console.log('[Store] 이미 소켓이 활성화되어 있어 연결을 유지합니다.');
      return;
    }

    // 만약 남은 client가 있으면 disconnect
    if (state.client) {
      state.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 200)); // 서버 세션 정리 시간 확보
    }

    const headers = getHeaders();
    if (!headers['Authorization']) {
      console.error('토큰이 없어 소켓에 연결할 수 없습니다.');
      return;
    }

    const newClient = new Client({
      brokerURL: SOCKET_URL,
      connectHeaders: headers,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log('[Store] 소켓이 연결되었습니다.');
        set({ isConnected: true });
      },
      onStompError: (frame) => {
        console.error('[Store] STOMP 오류:', frame.headers['message']);
        // 에러 발생 시 즉시 상태 초기화하여 Ghost 상태 방지
        set({ isConnected: false, moveSubscription: null });
      },
      onWebSocketClose: () => {
        console.log('[Store] 소켓 연결이 해제되었습니다.');
        set({ isConnected: false, moveSubscription: null });
      },
    });

    newClient.activate();
    set({ client: newClient });
  },

  disconnect: () => {
    const { client, unsubscribeMove } = get();
    if (client) {
      unsubscribeMove();
      client.deactivate();
      set({
        client: null,
        isConnected: false,
        moveSubscription: null,
      });
    }
  },

  // 이동 로직
  subscribeMove: async (floorId, onMoveReceive) => {
    const { client, unsubscribeMove, isConnected } = get();

    // isConnected가 true일 때만 진행
    if (!client || !client.connected || !isConnected) {
      console.warn('[Store] 소켓이 준비되지 않아 구독할 수 없습니다.');
      return;
    }

    try {
      unsubscribeMove({ sendExit: false });
      // 해제 패킷이 먼저 처리되도록 미세 지연
      await new Promise((resolve) => setTimeout(resolve, 50));

      const subscriptionId = `sub-${floorId}`;
      const headers = { ...getHeaders(), id: subscriptionId };

      if (!client.connected) return;

      // 새로운 층 구독
      const subscription = client.subscribe(
        `/topic/floor/${floorId}/move`,
        (message) => {
          try {
            const moves: MoveBroadcast[] = JSON.parse(message.body);
            onMoveReceive(moves);
          } catch (e) {
            console.error(e);
          }
        },
        headers,
      );

      set({ moveSubscription: subscription, subscribedFloorId: floorId });
      console.log(`[Store] ${floorId} 구독 시작`);
    } catch (error) {
      console.error('구독 실패:', error);
    }
  },

  unsubscribeMove: (options) => {
    const shouldSendExit = options?.sendExit ?? true;
    const exitFloorId = options?.exitFloorId;
    const { sendExit, moveSubscription, client, subscribedFloorId } = get();
    if (client?.connected) {
      // 구독 해제 전에 백엔드에 퇴장 메시지 전송
      // exitFloorId가 주어지면 그 값을 우선 사용한다.
      const resolvedExitFloorId = exitFloorId ?? subscribedFloorId;
      if (resolvedExitFloorId && shouldSendExit) {
        sendExit({ floorId: resolvedExitFloorId });
        console.log(`[Store] ${resolvedExitFloorId} 퇴장 메시지 전송`);
      }

      if (moveSubscription) {
        try {
          moveSubscription.unsubscribe(getHeaders());
          console.log('[Store] 구독 해제 요청 전송');
        } catch (error) {
          console.warn(
            // 이미 닫힌 소켓에 대한 에러 방지
            '[Store] 구독 해제 실패:',
            error,
          );
        }
      }
    }
    set({ moveSubscription: null, subscribedFloorId: null });
  },

  sendEnter: (req) => {
    const { client } = get();
    if (client?.active) {
      client.publish({
        destination: '/app/move/enter',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
    }
  },
  sendMove: (req) => {
    const { client } = get();
    if (client?.active) {
      client.publish({
        destination: '/app/move',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
    }
  },
  sendExit: (req) => {
    const { client } = get();
    if (client?.active) {
      client.publish({
        destination: '/app/move/exit',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
    }
  },
  sendLeaveRoom: (req) => {
    const { client } = get();
    if (client?.active) {
      // 방 퇴장용 STOMP 메시지 전송
      client.publish({
        destination: '/app/leaveRoom',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
    }
  },
}));
