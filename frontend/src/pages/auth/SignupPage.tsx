import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import bgImage from '@/assets/images/signup_bg.png';
import { PixelButton } from '@/components/common/PixelButton';
import { PixelContainer } from '@/components/common/PixelContainer';
import { PixelInput } from '@/components/common/PixelInput';
import {
  useCheckEmail,
  useSignup,
  useVerifyEmail,
} from '@/services/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './SignupPage.css';

export const SignupPage = () => {
  // 입력값 관련 상태
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [checkPassword, setCheckPassword] = useState('');

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const navigate = useNavigate();

  const { mutate: checkEmail, isPending: isSending } = useCheckEmail();
  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { openModal } = useModalStore();
  const { mutate: signup, isPending: isSigningUp } = useSignup();

  // 인증 코드 전송
  const handleSendCode = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email)
      return openModal('alert', {
        title: '알림',
        message: '이메일을 입력해주세요.',
      });

    checkEmail(
      { email },
      {
        onSuccess: () => {
          openModal('alert', {
            title: '알림',
            message: '인증 코드가 전송되었습니다. 이메일을 확인해주세요.',
          });
          setIsCodeSent(true);
          setIsEmailVerified(false);
        },

        onError: (error) => {
          openModal('alert', {
            title: '알림',
            message: error.response?.data?.message || '인증 메일 전송 실패',
          });
        },
      },
    );
  };

  // 인증 코드 확인
  const handleVerifyCode = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!code)
      return openModal('alert', {
        title: '알림',
        message: '인증 코드를 입력해주세요.',
      });

    verifyEmail(
      { email, code },
      {
        onSuccess: () => {
          openModal('alert', {
            title: '알림',
            message: '이메일 인증이 완료되었습니다!',
          });
          setIsEmailVerified(true);
          setIsCodeSent(false);
        },

        onError: (error) => {
          openModal('alert', {
            title: '알림',
            message:
              error.response?.data?.message || '인증 코드 확인에 실패했습니다.',
          });
        },
      },
    );
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailVerified) {
      return openModal('alert', {
        title: '알림',
        message: '이메일 인증을 먼저 완료해주세요.',
      });
    }
    if (!nickname || !password || !checkPassword) {
      return openModal('alert', {
        title: '알림',
        message: '모든 정보를 입력해주세요.',
      });
    }
    if (password !== checkPassword) {
      return openModal('alert', {
        title: '알림',
        message: '비밀번호가 일치하지 않습니다.',
      });
    }

    signup(
      { email, nickname, password },
      {
        onSuccess: () => {
          openModal('alert', { title: '알림', message: '회원 가입 성공!' });
        },
        onError: (error) => {
          const msg = error.response?.data?.message;
          openModal('alert', {
            title: '회원가입 실패',
            message: msg || '회원가입 실패',
          });
        },
      },
    );
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
    >
      <PixelContainer
        variant="board"
        header="회원 가입"
        style={{ width: '420px', margin: 'auto' }}
      >
        <form className={styles.formWrapper} onSubmit={handleSignup}>
          {/* 이메일 + 코드 검증 */}
          <div className={styles.checkRow}>
            <div className={styles.checkInput}>
              <PixelInput
                label="이메일"
                placeholder="example@liverary.com"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailVerified} // 인증 완료시 이메일 변경 불가
              />
            </div>
            <PixelButton
              type="button"
              className={styles.checkBtn}
              onClick={handleSendCode}
              disabled={isEmailVerified || isSending}
            >
              {isSending
                ? '전송중'
                : isCodeSent
                  ? '재전송'
                  : isEmailVerified
                    ? '인증완료'
                    : '인증요청'}
            </PixelButton>
          </div>
          {/* 인증 코드 입력 */}
          {isCodeSent && !isEmailVerified && (
            <div className={styles.checkRow}>
              <div className={styles.checkInput}>
                <PixelInput
                  label="인증 코드"
                  placeholder="인증코드 6자리"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <PixelButton
                type="button"
                className={styles.checkBtn}
                onClick={handleVerifyCode}
                disabled={isVerifying}
              >
                {isVerifying ? '확인 중' : '확인'}
              </PixelButton>
            </div>
          )}

          {/* 닉네임 */}
          <PixelInput
            label="닉네임"
            placeholder="한글/영문 10자 이내"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          {/* 비밀번호 */}
          <PixelInput
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력해주세요"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PixelInput
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            fullWidth
            value={checkPassword}
            onChange={(e) => setCheckPassword(e.target.value)}
          />

          {/* 가입 완료 버튼 */}
          <PixelButton
            fullWidth
            size="lg"
            style={{ marginTop: '2rem' }}
            onClick={handleSignup}
            disabled={!isEmailVerified || isSigningUp}
          >
            독서 시작하기
          </PixelButton>

          {/* 하단 링크 */}
          <div className={styles.footerText}>
            이미 계정이 있으신가요?
            <span
              className={styles.linkText}
              onClick={() => navigate('/login')}
            >
              로그인
            </span>
          </div>
        </form>
      </PixelContainer>
    </div>
  );
};
