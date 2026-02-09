import { memo, useEffect, useRef } from 'react';

import { useSoundStore } from '@/store/useSoundStore';

interface RemoteAudioProps {
  stream: MediaStream;
  userId: string;
}

// 렌더링 최적화를 위해 memo 사용
export const RemoteAudio = memo(({ stream, userId }: RemoteAudioProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const isIncomingAudioMuted = useSoundStore(
    (state) => state.incomingAudioMuted,
  );

  // 스트림 연결 및 재생 로직
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // 크롬의 자동 재생 정책에 막혔을 때 로그 남기기
          console.warn(
            `[${userId}] 자동 재생 차단됨 (사용자 클릭 필요):`,
            error,
          );
        });
      }
    }
  }, [stream, userId]);

  // 음소거 상태 동기화 로직
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isIncomingAudioMuted;
    }
  }, [isIncomingAudioMuted]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      controls={false}
      style={{ display: 'none' }}
    />
  );
});

RemoteAudio.displayName = 'RemoteAudio';
