import { useEffect, useRef, useState } from 'react';

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
  AudioContext: typeof AudioContext;
}

export const useMicVolume = (stream: MediaStream | null) => {
  const [volume, setVolume] = useState(0);

  const frameRef = useRef<number | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    // 1. 스트림이 없으면 종료
    if (!stream) return;

    try {
      const win = window as unknown as WindowWithWebkitAudio;
      const AudioContextClass = win.AudioContext || win.webkitAudioContext;

      if (!AudioContextClass) {
        console.error('이 브라우저는 Web Audio API를 지원하지 않습니다.');
        return;
      }

      // AudioContext 생성
      const audioContext = new AudioContextClass();
      contextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let lastRun = 0;

      const updateVolume = () => {
        // 3. 성능 최적화 (스로틀링): 약 20fps (50ms)로 제한
        const now = Date.now();

        if (now - lastRun > 50) {
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;

          // 감도 보정 (2.5배) 및 최대값 100 제한
          const normalizedVolume = Math.min(100, Math.round(average * 2.5));

          setVolume(normalizedVolume);
          lastRun = now;
        }

        // 다음 프레임 요청
        frameRef.current = requestAnimationFrame(updateVolume);
      };

      // 루프 시작
      updateVolume();

      // 4. Cleanup
      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }

        if (contextRef.current && contextRef.current.state !== 'closed') {
          contextRef.current.close();
          contextRef.current = null;
        }

        // 언마운트 시 볼륨 0 초기화
        setVolume(0);
      };
    } catch (e) {
      console.error('Mic volume visualization failed:', e);
    }
  }, [stream]);

  return volume;
};
