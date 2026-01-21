import { PixelButton } from '@/components/common/PixelButton';

import { theme } from '@/styles/theme.css';

export const UiTestPage = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        gap: '40px',
        color: theme.colors.white,
      }}
    >
      <h1> UI Test </h1>

      {/* 사이즈별 테스트 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <PixelButton size="sm">Small</PixelButton>
        <PixelButton size="md">Medium (Default)</PixelButton>
        <PixelButton size="lg">Large Button</PixelButton>
      </div>

      {/* Variant(색상) 테스트 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <PixelButton variant="primary">Primary</PixelButton>
        <PixelButton variant="danger">Danger</PixelButton>
      </div>

      {/* Full Width 테스트 */}
      <div
        style={{ width: '300px', border: '1px dashed #666', padding: '10px' }}
      >
        <p style={{ marginBottom: '10px', textAlign: 'center' }}>
          꽉 찬 버튼 (300px)
        </p>
        <PixelButton fullWidth>Login</PixelButton>
      </div>

      {/* 클릭 이벤트 테스트 */}
      <PixelButton onClick={() => alert('잘 작동합니다! 🔨')}>
        클릭해보세요!
      </PixelButton>
    </div>
  );
};
