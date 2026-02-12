import {
  Client,
  type IMessage,
  type StompHeaders,
  type StompSubscription,
} from '@stomp/stompjs';
import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';

import type {
  ChatBroadcast,
  ChatRequest,
  LeaveRoomRequest,
  MoveBroadcast,
  MoveEnterRequest,
  MoveExitRequest,
  MoveRequest,
} from '@/types/socket/socket.types';

interface SocketState {
  client: Client | null;
  isConnected: boolean;

  // 지역 구독 (맵마다 변경)
  moveSubscription: StompSubscription | null;
  chatSubscription: StompSubscription | null;
  subscribedFloorId: string | null;

  // 전역 구독 (게임 내내 유지)
  globalChatSubscription: StompSubscription | null;
  whisperSubscription: StompSubscription | null;

  // 소켓 연결 / 해제
  connect: () => void;
  disconnect: () => void;

  // 채널 관리 (이동 + 채팅)
  joinChannel: (
    floorId: string,
    onMoveReceive: (moves: MoveBroadcast[]) => void,
  ) => void;

  leaveChannel: (options?: {
    sendExit?: boolean;
    exitFloorId?: string;
  }) => void;

  // 전송 함수
  sendEnter: (req: MoveEnterRequest) => void;
  sendMove: (req: MoveRequest) => void;
  sendExit: (req: MoveExitRequest) => void;
  sendLeaveRoom: (req: LeaveRoomRequest) => void;
  sendChat: (req: ChatRequest) => void;
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

  // 초기 구독은 모두 null
  moveSubscription: null,
  chatSubscription: null,
  subscribedFloorId: null,
  globalChatSubscription: null,
  whisperSubscription: null,

  // 소켓 연결
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

        // 소켓 연결 즉시 전체 채팅과 귓속말 구독
        const globalSub = newClient.subscribe(
          '/topic/global/chat',
          (message) => handleIncomingChat(message),
          { ...getHeaders(), id: 'sub-global-chat' },
        );

        const whisperSub = newClient.subscribe(
          '/user/queue/chat',
          (message) => handleIncomingChat(message),
          { ...getHeaders(), id: 'sub-user-chat' },
        );

        set({
          globalChatSubscription: globalSub,
          whisperSubscription: whisperSub,
        });
      },
      onStompError: (frame) => {
        console.error('[Store] STOMP 오류:', frame.headers['message']);
        // 에러 발생 시 즉시 상태 초기화하여 Ghost 상태 방지
        set({
          isConnected: false,
          moveSubscription: null,
          chatSubscription: null,
          globalChatSubscription: null,
          whisperSubscription: null,
          subscribedFloorId: null,
        });
      },
      onWebSocketClose: () => {
        console.log('[Store] 소켓 연결이 해제되었습니다.');
        set({
          isConnected: false,
          moveSubscription: null,
          chatSubscription: null,
          globalChatSubscription: null,
          whisperSubscription: null,
          subscribedFloorId: null,
        });
      },
    });

    newClient.activate();
    set({ client: newClient });
  },

  // 소켓 연결 해제
  disconnect: () => {
    const { client, leaveChannel } = get();
    if (client) {
      leaveChannel();
      client.deactivate();
      // 모든 상태 초기화 필요
      set({
        client: null,
        isConnected: false,
        moveSubscription: null,
        chatSubscription: null,
        globalChatSubscription: null,
        whisperSubscription: null,
        subscribedFloorId: null,
      });
    }
  },

  // 맵 입장 및 구독
  joinChannel: async (floorId, onMoveReceive) => {
    const { client, leaveChannel, isConnected } = get();

    // isConnected가 true일 때만 진행
    if (!client || !client.connected || !isConnected) {
      console.warn('[Store] 소켓이 준비되지 않아 구독할 수 없습니다.');
      return;
    }

    try {
      leaveChannel({ sendExit: false });
      // 해제 패킷이 먼저 처리되도록 미세 지연
      await new Promise((resolve) => setTimeout(resolve, 50));

      const baseHeaders = getHeaders();

      // 이동 정보 구독
      const moveHeaders = { ...baseHeaders, id: `sub-move-${floorId}` };
      const moveSub = client.subscribe(
        `/topic/floor/${floorId}/move`,
        (message) => {
          try {
            const moves: MoveBroadcast[] = JSON.parse(message.body);
            onMoveReceive(moves);
          } catch (e) {
            console.error(e);
          }
        },
        moveHeaders,
      );

      // 맵 채팅 정보 구독
      const chatHeaders = { ...baseHeaders, id: `sub-chat-${floorId}` };
      const chatSub = client.subscribe(
        `/topic/floor/${floorId}/chat`,
        (message) => handleIncomingChat(message),
        chatHeaders,
      );

      // 채팅방 입장 알림
      const user = useAuthStore.getState().user;
      client.publish({
        destination: '/app/chat/enter',
        headers: baseHeaders,
        body: JSON.stringify({
          floorId,
          nickname: user?.nickname || 'Unknown',
        }),
      });

      set({
        moveSubscription: moveSub,
        chatSubscription: chatSub,
        subscribedFloorId: floorId,
      });
      console.log(`[Socket] ${floorId} 구독 시작`);
    } catch (error) {
      console.error('[Socket] 구독 실패:', error);
    }
  },

  // 맵 퇴장 및 구독 해제
  leaveChannel: (options) => {
    const shouldSendExit = options?.sendExit ?? true;
    const exitFloorId = options?.exitFloorId;
    const {
      sendExit,
      moveSubscription,
      chatSubscription,
      client,
      subscribedFloorId,
    } = get();

    if (client?.connected) {
      // 구독 해제 전에 백엔드에 퇴장 메시지 전송 (exitFloorId 우선 사용)
      const resolvedExitFloorId = exitFloorId ?? subscribedFloorId;

      if (resolvedExitFloorId && shouldSendExit) {
        // 이동 퇴장 알림
        sendExit({ floorId: resolvedExitFloorId });

        // 채팅 퇴장 알림
        client.publish({
          destination: '/app/chat/exit',
          headers: getHeaders(),
          body: JSON.stringify({ floorId: resolvedExitFloorId }),
        });
        console.log(`[Socket] ${resolvedExitFloorId} 퇴장 메시지 전송`);
      }

      // 맵 관련 구독만 해제
      if (moveSubscription) {
        try {
          moveSubscription.unsubscribe(getHeaders());
          console.log('[Socket] 움직임 구독 해제 요청 전송');
        } catch (error) {
          console.warn(
            // 이미 닫힌 소켓에 대한 에러 방지
            '[Socket] 움직임 구독 해제 실패:',
            error,
          );
        }
      }

      if (chatSubscription) {
        try {
          chatSubscription.unsubscribe(getHeaders());
          console.log('[Socket] 채팅 구독 해제 요청 전송');
        } catch (error) {
          console.warn('[Socket] 채팅 구독 해제 실패:', error);
        }
      }
    }

    // 상태 초기화 (whisper과 glboal은 초기화하면 안 됨!)
    set({
      moveSubscription: null,
      chatSubscription: null,
      subscribedFloorId: null,
    });
  },

  // 전송 함수
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

  sendChat: (req) => {
    const { client } = get();
    if (client?.active) {
      client.publish({
        destination: '/app/chat/message',
        headers: getHeaders(),
        body: JSON.stringify(req),
      });
    } else {
      console.warn('[Socket] 연결이 끊겨 메시지를 보내지 못했습니다.');
    }
  },
}));

const handleIncomingChat = (message: IMessage) => {
  if (!message.body) return;

  console.log('📩 [Raw Message]:', message.body);

  try {
    const chatData: ChatBroadcast = JSON.parse(message.body);

    const myId = useAuthStore.getState().user?.userId || '';

    // ID 없으면 임시 생성
    if (!chatData.id) chatData.id = `temp-${Date.now()}`;

    useChatStore.getState().addMessage(chatData, myId);
  } catch (error) {
    console.error('[Socket] 파싱 에러:', error);
  }
};
