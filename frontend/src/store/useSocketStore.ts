import {
  Client,
  type StompHeaders,
  type StompSubscription,
} from '@stomp/stompjs';
import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';

import type {
  MoveBroadcast,
  MoveEnterRequest,
  MoveExitRequest,
  MoveRequest,
} from '@/types/socket.types';

interface SocketState {
  client: Client | null;
  isConnected: boolean;
  moveSubscription: StompSubscription | null;

  // 소켓 연결 / 해제
  connect: () => void;
  disconnect: () => void;

  // 층 입장 및 구독
  subscribeMove: (
    floorId: string,
    onMoveReceive: (moves: MoveBroadcast[]) => void,
  ) => void;
  unsubscribeMove: () => void;

  sendEnter: (req: MoveEnterRequest) => void;
  sendMove: (req: MoveRequest) => void;
  sendExit: (req: MoveExitRequest) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// 최신 토큰으로 헤더 만들기
const getHeaders = (): StompHeaders => {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useSocketStore = create<SocketState>((set, get) => ({
  client: null,
  isConnected: false,
  moveSubscription: null,

  connect: () => {
    // 이미 연결되어있으면 패스
    if (get().client?.activate) return;

    const headers = getHeaders();
    if (!headers['Authorization']) {
      console.error('토큰이 없어 소켓에 연결할 수 없습니다.');
      return;
    }

    const client = new Client({
      brokerURL: SOCKET_URL,
      connectHeaders: headers,
      reconnectDelay: 5000, // 5초 뒤 자동 재연결
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('소켓이 연결되었습니다.');
        set({ isConnected: true });
      },
      onStompError: (frame) => {
        console.error('오류가 발생했습니다:', frame.headers['message']);
      },
      onWebSocketClose: () => {
        console.log('소켓 연결이 해제되었습니다.');
        set({ isConnected: false });
      },
    });

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({
        client: null,
        isConnected: false,
        moveSubscription: null,
      });
    }
  },

  // 이동 로직
  subscribeMove: (floorId, onMoveReceive) => {
    const { client } = get();
    if (!client || !client.active) {
      console.warn('소켓이 연결되지 않아 구독할 수 없습니다.');
      return;
    }

    // 기존 구독 해제
    get().unsubscribeMove();

    const subscription = client.subscribe(
      `/topic/floor/${floorId}/move`,
      (message) => {
        try {
          const moves: MoveBroadcast[] = JSON.parse(message.body);
          onMoveReceive(moves);
        } catch (error) {
          console.error('이동 데이터 파싱 실패:', error);
        }
      },
    );

    set({ moveSubscription: subscription });
  },
  unsubscribeMove: () => {
    get().moveSubscription?.unsubscribe();
    set({ moveSubscription: null });
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
}));
