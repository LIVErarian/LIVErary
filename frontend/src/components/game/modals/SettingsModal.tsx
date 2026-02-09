import { PixelModal } from '@/components/common/PixelModal';
import { useMicVolume } from '@/hooks/common/useMicVolume';
import { useModalStore } from '@/store/useModalStore';
import { useSoundStore } from '@/store/useSoundStore';

import * as styles from './SettingsModal.css';

export const SettingsModal = () => {
  const { closeModal } = useModalStore();

  // 사운드 스토어에서 모든 상태 가져오기 (마이크 스트림 포함)
  const {
    volume,
    setVolume,
    isBgmMuted,
    toggleBgmMute,
    incomingAudioMuted,
    toggleIncomingMute,
    localStream,
  } = useSoundStore();

  // 가져온 스트림을 시각화 훅에 전달
  const micVolume = useMicVolume(localStream);

  return (
    <PixelModal
      isOpen={true}
      onClose={closeModal}
      title="환경 설정"
      width="420px"
    >
      <div className={styles.container}>
        {/* 배경음악 (BGM) 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>배경음악 (BGM)</div>

          {/* 음소거 체크박스 */}
          <div className={styles.row}>
            <label className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                className={styles.hiddenCheckbox}
                checked={isBgmMuted}
                onChange={toggleBgmMute}
              />
              <div className={styles.customCheckbox}>{isBgmMuted && 'v'}</div>
              <span className={styles.label}>배경음악 끄기</span>
            </label>
          </div>

          {/* 볼륨 슬라이더 */}
          <div className={styles.row}>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={isBgmMuted} // 음소거 시 조작 불가
              className={styles.slider}
            />
            <span
              className={styles.label}
              style={{ width: '40px', textAlign: 'right' }}
            >
              {isBgmMuted ? 'OFF' : `${Math.round(volume * 100)}%`}
            </span>
          </div>
        </div>

        {/* 음성 채팅 설정 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>음성 채팅</div>

          {/* 다른 사람 소리 끄기 */}
          <div className={styles.row}>
            <label className={styles.checkboxWrapper}>
              <input
                type="checkbox"
                className={styles.hiddenCheckbox}
                checked={incomingAudioMuted}
                onChange={toggleIncomingMute}
              />
              <div className={styles.customCheckbox}>
                {incomingAudioMuted && 'v'}
              </div>
              <span className={styles.label}>
                다른 사람 소리 끄기 (스피커 OFF)
              </span>
            </label>
          </div>

          {/* 마이크 입력 확인 (시각화) */}
          <div style={{ marginTop: '12px' }}>
            <span className={styles.label} style={{ fontSize: '0.8rem' }}>
              내 마이크 입력 확인:
            </span>

            {/* 초록색 게이지 바 */}
            <div className={styles.micBarContainer}>
              <div
                className={styles.micBarFill}
                style={{ width: `${micVolume}%` }}
              />
            </div>

            {/* 스트림 연결 상태 안내 */}
            {!localStream && (
              <p style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                * 마이크가 연결되어 있는지 확인해주세요. (방 입장 필요)
              </p>
            )}
          </div>
        </div>
      </div>
    </PixelModal>
  );
};
