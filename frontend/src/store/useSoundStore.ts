import { Assets } from 'pixi.js';
import { create } from 'zustand';

interface SoundState {
  bgm: HTMLAudioElement | null;
  currentKey: string | null;
  currentPlaylist: string[];
  volume: number;
  isBgmMuted: boolean;
  incomingAudioMuted: boolean;
  playId: number;
  localStream: MediaStream | null;

  playPlaylist: (playlist: string[]) => Promise<void>;
  stopBGM: () => void;
  setVolume: (volume: number) => void;
  toggleBgmMute: () => void;
  toggleIncomingMute: () => void;
  setLocalStream: (stream: MediaStream | null) => void;

  _playNext: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  bgm: null,
  currentKey: null,
  currentPlaylist: [],
  volume: 0.5,
  isBgmMuted: false,
  incomingAudioMuted: false,
  playId: 0,
  localStream: null,

  playPlaylist: async (playlist: string[]) => {
    const { currentPlaylist, bgm } = get();

    // 동일한 리스트면 무시
    if (JSON.stringify(playlist) === JSON.stringify(currentPlaylist)) {
      // 단, 현재 재생 중인 오디오가 멈춰있거나 없으면 실행해야 함
      if (bgm && !bgm.paused) return;
    }

    //  새 리스트 저장 및 ID 증가
    const newId = Date.now(); // 유니크한 ID 생성
    set({ currentPlaylist: playlist, playId: newId });

    // 재생 시작
    get()._playNext();
  },

  _playNext: async () => {
    // 함수 시작 시점의 ID를 캡처 (클로저)
    const { playId: currentRequestPlayId } = get();

    // 재생 할 곡 뽑기
    const { currentPlaylist } = get();
    if (currentPlaylist.length === 0) return;

    const randomIndex = Math.floor(Math.random() * currentPlaylist.length);
    const nextKey = currentPlaylist[randomIndex];

    try {
      // 파일 로딩
      const resource = await Assets.get(nextKey);
      const src = typeof resource === 'string' ? resource : resource?.src;

      if (!src) {
        console.warn(`[SoundStore] ❌ 파일 없음: ${nextKey}`);
        return;
      }

      // 로딩이 끝난 후에도 요청이 유효한지 확인
      if (get().playId !== currentRequestPlayId) {
        console.log(`[SoundStore] 🚫 이전 요청 취소됨: ${nextKey}`);
        return;
      }

      // 기존 BGM 확실하게 죽이기
      const { bgm: prevBgm, volume, isBgmMuted } = get();
      if (prevBgm) {
        prevBgm.pause();
        prevBgm.onended = null;
        prevBgm.src = '';
      }

      // 새 오디오 생성 및 재생
      const newAudio = new Audio(src);
      newAudio.loop = false;

      newAudio.onended = () => {
        // 노래가 끝나서 다음 곡 넘어갈 때는 ID 유지
        console.log('🎵 노래 끝! 다음 곡 재생...');
        get()._playNext();
      };

      newAudio.volume = isBgmMuted ? 0 : volume;
      newAudio.muted = isBgmMuted || volume < 0.01;

      await newAudio.play();

      set({ bgm: newAudio, currentKey: nextKey });
      console.log(`[SoundStore] ▶️ 재생 성공: ${nextKey}`);
    } catch (error) {
      console.error(`[SoundStore] 재생 실패:`, error);
    }
  },

  stopBGM: () => {
    const { bgm } = get();
    if (bgm) {
      bgm.pause();
      bgm.onended = null;
      bgm.currentTime = 0;
    }
    // playId를 갱신해서 로딩 중인 음악도 취소시킴
    set({
      bgm: null,
      currentKey: null,
      currentPlaylist: [],
      playId: Date.now(),
    });
  },

  setVolume: (val: number) => {
    const { bgm, isBgmMuted } = get();
    const newVol = Math.max(0, Math.min(1, val));

    if (bgm && !isBgmMuted) {
      bgm.volume = newVol;
      bgm.muted = newVol < 0.01;
    }
    set({ volume: newVol });
  },

  toggleBgmMute: () => {
    const { bgm, isBgmMuted, volume } = get();
    const nextState = !isBgmMuted;

    if (bgm) {
      bgm.volume = nextState ? 0 : volume;
      bgm.muted = nextState || volume < 0.01;
    }
    set({ isBgmMuted: nextState });
  },

  toggleIncomingMute: () => {
    set((state) => ({ incomingAudioMuted: !state.incomingAudioMuted }));
  },

  setLocalStream: (stream) => set({ localStream: stream }),
}));
