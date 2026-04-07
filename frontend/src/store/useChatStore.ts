import { create } from 'zustand';

import type { ChatBroadcast } from '@/types/socket/chat.types';

export type TabType = 'ALL' | 'LOCAL' | string; // string은 유저 아이디

interface ChatStore {
  messages: ChatBroadcast[]; // 채팅 기록
  currentTab: TabType; // 보고 있는 탭 (ALL: 전체, LOCAL: 현재 맵, 귓속말탭)
  privateChats: Record<string, string>; // 현재 열려있는 귓속말 탭 목록 (ID: 닉네임 맵핑)
  isMinimized: boolean; // 채팅창 최소화 여부

  addMessage: (msg: ChatBroadcast, myId: string) => void; // 메시지 수신 및 분류
  setTab: (tab: TabType) => void; // 탭 변경
  openPrivateChat: (userId: string, nickname: string) => void; // 귓속말 시작하기
  closePrivateChat: (userId: string) => void; // 귓속말 종료
  toggleMinimize: () => void; // 채팅창 최소화
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentTab: 'ALL',
  privateChats: {},
  isMinimized: false,

  /**
   * 채팅 기록을  저장합니다.
   * @param msg 받거나 전송한 채팅
   * @param myId 내 ID
   */
  addMessage: (msg, myId) => {
    set((state) => {
      const newMessages = [...state.messages, msg]; // 메시지 저장
      if (newMessages.length > 50) newMessages.shift(); // 50개만 저장

      // 귓속말인 경우 탭 목록 업데이트
      const nextPrivateChats = { ...state.privateChats };

      // 귓속말이 왔을 때 탭 목록 갱신 로직
      if (msg.type === 'WHISPER') {
        // 나 혹은 상대방 중 내가 아닌 쪽의 정보를 추출
        const isFromMe = msg.senderId === myId;
        // 내가 보냈으면 target을 탭에 추가 / 내가 받았으면 sender를 탭에 추가
        const otherId = isFromMe ? msg.targetUserId : msg.senderId;
        const otherName = isFromMe ? msg.targetNickname : msg.senderNickname;

        // 상대방 정보가 있고 아직 탭에 없으면 탭에 상대방 추가
        if (otherId && otherName && !nextPrivateChats[otherId]) {
          nextPrivateChats[otherId] = otherName;
        }
      }

      return {
        messages: newMessages,
        privateChats: nextPrivateChats,
      };
    });
  },

  /**
   * 선택한 탭으로 전환합니다.
   * @param tab 선택한 탭
   * @returns
   */
  setTab: (tab) => set({ currentTab: tab }),

  /**
   * 귓속말을 시작합니다
   * @param userId 귓속말을 받는 사람의 id
   * @param nickname 귓속말을 받는 사람의 닉네임
   * @returns
   */
  openPrivateChat: (userId, nickname) =>
    set((state) => ({
      privateChats: { ...state.privateChats, [userId]: nickname },
      currentTab: userId, // 탭을 만들면서 바로 그 탭으로 이동
    })),

  /**
   * 귓속말을 종료합니다
   * @param userId 귓속말을 하고 있던 유저의 ID
   * @returns
   */
  closePrivateChat: (userId) =>
    set((state) => {
      const nextChats = { ...state.privateChats }; // 기존 목록 가져오기
      delete nextChats[userId]; // 제거할 유저의 ID를 기존 목록에서 제거
      // 닫으려는 탭을 보고 있었다면 'ALL'로 이동
      const nextTab = state.currentTab === userId ? 'ALL' : state.currentTab;
      return {
        privateChats: nextChats,
        currentTab: nextTab,
      };
    }),

  /**
   * 채팅창을 최소화합니다
   * @returns
   */
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
}));
