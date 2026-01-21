import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';

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
        overflow: 'auto',
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

      {/* Input Field 테스트 */}
      <div
        style={{ width: '300px', padding: '20px', border: '1px dashed #666' }}
      >
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          Login Form Preview
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PixelInput label="ID" placeholder="아이디를 입력하세요" fullWidth />
          <PixelInput
            label="PASSWORD"
            type="password"
            placeholder="비밀번호"
            fullWidth
          />
          <PixelButton fullWidth>LOGIN</PixelButton>
        </div>
      </div>

      {/* 6. [최종] 로그인 모달 조립 (Dark Theme) */}
      <div style={{ padding: '40px' }}>
        <PixelContainer
          variant="dark"
          title="LIVErary"
          style={{ width: '400px' }}
        >
          <p style={{ marginBottom: '20px', opacity: 0.8, fontSize: '0.9rem' }}>
            Welcome back to the Metaverse Library!
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
            }}
          >
            <PixelInput label="ID" placeholder="user_123" fullWidth />
            <PixelInput
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              fullWidth
            />
            <div style={{ height: '10px' }} /> {/* 간격 띄우기 */}
            <PixelButton fullWidth size="lg">
              LOG IN
            </PixelButton>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontSize: '0.8rem',
                color: '#bcaaa4',
              }}
            >
              <span style={{ cursor: 'pointer' }}>Sign Up</span>
              <span style={{ cursor: 'pointer' }}>Forgot Password?</span>
            </div>
          </div>
        </PixelContainer>
      </div>

      {/* 7. [최종] 게시판 조립 (Light Theme) */}
      <div style={{ padding: '40px' }}>
        <PixelContainer
          variant="board"
          title="공지사항"
          style={{ width: '500px', alignItems: 'stretch' }}
        >
          {/* 게시글 리스트 예시 */}
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {[
              '서버 점검 안내',
              '신규 도서 입고 알림',
              '이벤트 당첨자 발표',
            ].map((text, i) => (
              <li
                key={i}
                style={{
                  borderBottom: '2px dashed #b89f7d',
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{text}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  2026.01.21
                </span>
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <PixelButton size="sm">닫기</PixelButton>
          </div>
        </PixelContainer>
      </div>
    </div>
  );
};
