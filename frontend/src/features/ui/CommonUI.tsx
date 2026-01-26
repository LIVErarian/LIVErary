import * as styles from '@/components/layout/GameLayout.css';

export const CommonUI = () => {
  return (
    // TODO: 채팅 등 공통 UI 구현 (설정 위치 Menu 안으로 옮기기)
    <div style={{ position: 'absolute', top: 10, right: 10 }}>
      {/* interactive 클래스를 줘야 클릭 가능 */}
      <button className={styles.interactive}>설정</button>
    </div>
  );
};
