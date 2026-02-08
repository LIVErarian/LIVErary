import { Assets } from 'pixi.js';
import { create } from 'zustand';

interface SoundState {
  // 상태 (State)
  bgm: HTMLAudioElement | null; // 현재 재생 중인 오디오 객체
  currentKey: string | null; // 현재 재생 중인 곡의 키 (예: 'calm_1')
  volume: number; // 0.0 ~ 1.0
  isMuted: boolean; // 음소거 여부

  // 액션 (Actions)
  playBGM: (key: string) => Promise<void>;
  stopBGM: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  bgm: null,
  currentKey: null,
  volume: 0.5, // 기본 볼륨 50%
  isMuted: false,

  /**
   * 🎵 BGM 재생 (Assets에 로드된 파일 사용)
   */
  playBGM: async (key: string) => {
    const { bgm, currentKey, volume, isMuted } = get();

    // 이미 같은 노래가 재생 중이면 무시 (끊김 방지)
    if (bgm && currentKey === key && !bgm.paused) {
      return;
    }

    // 기존 노래 정지
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0; // 되감기
    }

    try {
      // Pixi Assets에서 URL 가져오기
      const resource = await Assets.get(key);

      // 만약 resource가 없거나 이상하면 에러 방지
      const src = typeof resource === 'string' ? resource : resource?.src;

      if (!src) {
        console.warn(`[SoundStore] ❌ 오디오 파일을 찾을 수 없습니다: ${key}`);
        return;
      }

      // 새 오디오 객체 생성 및 설정
      const newAudio = new Audio(src);
      newAudio.volume = isMuted ? 0 : volume;

      // 재생 시도 (브라우저 정책 예외 처리)
      const playPromise = newAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(
            '[SoundStore] ⚠️ 자동 재생이 차단되었습니다 (사용자 클릭 필요):',
            error,
          );
        });
      }

      // 상태 업데이트
      set({ bgm: newAudio, currentKey: key });
      console.log(`[SoundStore] 🎵 재생 시작: ${key}`);
    } catch (error) {
      console.error(`[SoundStore] 재생 실패: ${key}`, error);
    }
  },

  /**
   * 🛑 정지
   */
  stopBGM: () => {
    const { bgm } = get();
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }
    set({ bgm: null, currentKey: null });
  },

  /**
   * 🔊 볼륨 조절 (0.0 ~ 1.0)
   */
  setVolume: (val: number) => {
    const { bgm, isMuted } = get();
    // 범위 제한 (0~1)
    const newVol = Math.max(0, Math.min(1, val));

    // 현재 재생 중인 오디오에도 즉시 반영
    if (bgm && !isMuted) {
      bgm.volume = newVol;
    }
    set({ volume: newVol });
  },

  /**
   * 🔇 음소거 토글
   */
  toggleMute: () => {
    const { bgm, isMuted, volume } = get();
    const nextMuteState = !isMuted;

    if (bgm) {
      bgm.volume = nextMuteState ? 0 : volume;
    }
    set({ isMuted: nextMuteState });
  },
}));
