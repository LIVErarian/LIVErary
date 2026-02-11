import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { type TabType, useChatStore } from '@/store/useChatStore';

import type { ChatBroadcast, ChatType } from '@/types/socket/chat.types';

import * as styles from './GameChatWidget.css';

const WIDGET_HEIGHT = 260; // 펼쳤을 때 높이
const HEADER_HEIGHT = 32; // 접었을 때 높이

export const GameChatWidget = () => {
  const {
    messages,
    currentTab,
    privateChats,
    isMinimized,
    setTab,
    closePrivateChat,
    toggleMinimize,
    addMessage,
  } = useChatStore();
  const user = useAuthStore((state) => state.user);

  const MY_ID = user?.userId || 'guest';
  const MY_NICKNAME = user?.nickname || '게스트';

  const [inputValue, setInputValue] = useState('');

  const [position, setPosition] = useState({
    x: 150,
    y: window.innerHeight - (WIDGET_HEIGHT + 40),
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sendTarget, setSendTarget] = useState<ChatType>('LOCAL');

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  /**
   * 채팅창을 최소화합니다
   * @param e 마우스 이벤트
   */
  const handleToggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation(); // 드래그나 다른 이벤트 방지

    const heightDiff = WIDGET_HEIGHT - HEADER_HEIGHT;

    if (isMinimized) {
      // 펼치기 (태그 부분이 올라가게)
      setPosition((prev) => ({ ...prev, y: prev.y - heightDiff }));
    } else {
      // 접기 (상단이 하단으로 내려오게)
      setPosition((prev) => ({ ...prev, y: prev.y + heightDiff }));
    }
    toggleMinimize();
  };

  /**
   * 메세지를 필터링하여 보여줍니다.
   */
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (currentTab === 'ALL') return true;
      if (currentTab === 'LOCAL') return msg.type === 'LOCAL';
      if (currentTab === msg.senderId || currentTab === msg.targetUserId) {
        return msg.type === 'WHISPER';
      }
      return false;
    });
  }, [messages, currentTab]);

  // 자동 스크롤
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  /**
   * 채팅창을 이동시킬 수 있게 헤더 마우스 클릭을 감지합니다.
   * @param e 마우스 이벤트
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragRef.current && dragRef.current.contains(e.target as Node)) {
      setIsDragging(true);
      // 마우스 클릭위치와 채팅창의 꼭짓점 차이를 기억해서 위치 바꾸기
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  /**
   * 드래그를 통해 채팅창의 위치를 이동시킵니다.
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          // 위에서 계산한 보정값을 빼야 순간이동하지 않고 그대로 채팅창 이동
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    // 드래그 끝나면 리스너 제거
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  /**
   * 입력한 메세지를 전송합니다.
   * @param e 폼 이벤트
   * @returns
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 채팅 입력해도 새로고침 안 되도록
    if (!inputValue.trim()) return; // 빈 내용이면 무시

    // 임시 메시지 추가
    const tempMsg: ChatBroadcast = {
      id: Date.now().toString(),
      type: sendTarget,
      content: inputValue,
      senderId: MY_ID,
      senderNickname: MY_NICKNAME,
      timestamp: Date.now(),
    };
    addMessage(tempMsg, MY_ID);
    setInputValue('');
  };

  // 게임 엔진으로 키보드 이벤트 퍼지지 않게 막기
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={styles.widgetContainer}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '360px',
        height: isMinimized ? `${HEADER_HEIGHT}px` : `${WIDGET_HEIGHT}px`,
        transition: 'none',
      }}
    >
      {/* 헤더 */}
      <div
        ref={dragRef}
        className={styles.header}
        onMouseDown={handleMouseDown}
      >
        {/* 채팅 탭 선택 */}
        <div className={styles.tabGroup}>
          <TabButton
            id="ALL"
            label="전체"
            current={currentTab}
            onClick={setTab}
          />
          <TabButton
            id="LOCAL"
            label="일반"
            current={currentTab}
            onClick={setTab}
          />
          {Object.entries(privateChats).map(([userId, nickname]) => (
            <TabButton
              key={userId}
              id={userId}
              label={nickname}
              current={currentTab}
              onClick={setTab}
              onClose={() => closePrivateChat(userId)}
            />
          ))}
        </div>

        {/* 최소화 버튼 */}
        <button
          className={styles.controlButton}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleToggleMinimize}
        >
          {isMinimized ? '+' : '-'}
        </button>
      </div>

      {/* 채팅창 */}
      {!isMinimized && (
        <>
          <div ref={chatBodyRef} className={styles.messageList}>
            {filteredMessages.map((msg) => (
              <MessageItem key={msg.id} msg={msg} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.inputArea}>
            <select
              className={styles.targetSelect}
              value={sendTarget}
              onChange={(e) => setSendTarget(e.target.value as ChatType)}
              onKeyDown={handleKeyDown}
            >
              <option value="GLOBAL">전체</option>
              <option value="LOCAL">일반</option>
              <option value="WHISPER">귓속말</option>
            </select>

            <input
              className={styles.input}
              placeholder="메시지 입력 (Enter)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button type="submit" className={styles.sendButton}>
              전송
            </button>
          </form>
        </>
      )}
    </div>
  );
};

// 하위 컨텐츠
interface TabButtonProps {
  id: TabType; // 탭의 고유 ID ('ALL', 'LOCAL', userId)
  label: string; // 버튼에 표시할 텍스트
  current: TabType; // 현재 활성화된 탭 ID
  onClick: (id: TabType) => void; // 클릭 시 실행할 함수 (setTab)
  onClose?: () => void; // 닫기 버튼 클릭 시 실행할 함수 (귓속말 탭만 존재하므로 선택적)
}

const TabButton = ({
  id,
  label,
  current,
  onClick,
  onClose,
}: TabButtonProps) => (
  <button
    className={styles.tabButton}
    data-active={current === id}
    onMouseDown={(e) => e.stopPropagation()}
    onClick={() => onClick(id)}
  >
    {label}
    {onClose && (
      <span
        style={{ marginLeft: 4, opacity: 0.6 }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        x
      </span>
    )}
  </button>
);

// 메세지별 색상 지정
const MessageItem = ({ msg }: { msg: ChatBroadcast }) => {
  let color = '#fff';
  if (msg.type === 'GLOBAL') color = '#ffeb3b';
  if (msg.type === 'WHISPER') color = '#e040fb';
  if (msg.type === 'SYSTEM') color = '#69f0ae';

  const time = new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className={styles.messageItem} style={{ color }}>
      <span style={{ color: '#aaa', fontSize: '11px', marginRight: '4px' }}>
        [{time}]
      </span>
      {msg.type !== 'SYSTEM' && (
        <span className={styles.senderName}>{msg.senderNickname}:</span>
      )}
      <span>{msg.content}</span>
    </div>
  );
};
