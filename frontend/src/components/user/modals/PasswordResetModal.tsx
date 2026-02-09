import { useState } from 'react';
import { AxiosError } from 'axios';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { PixelModal } from '@/components/common/PixelModal';
import { useResetPassword } from '@/services/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './PasswordResetModal.css';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal = ({
  isOpen,
  onClose,
}: PasswordResetModalProps) => {
  const { openModal } = useModalStore();

  const { mutate: resetPassword, isPending } = useResetPassword();

  // 비밀번호 변경 폼 상태
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  // 모달 닫기
  const handleClose = () => {
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrorMessage('');
    onClose();
  };

  // 비밀번호 변경 폼 입력값 변경
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  // 비밀번호 변경 폼 제출
  const handleSubmit = () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('모든 항목을 입력해주세요.');
      return;
    }

    // 비밀번호 변경 API 호출
    resetPassword(
      { oldPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          openModal('alert', {
            title: '성공',
            message: '비밀번호가 변경되었습니다.',
            onConfirm: handleClose,
          });
        },
        onError: (error: AxiosError) => {
          const data = error.response?.data as {
            code?: string;
            message?: string;
          };
          setErrorMessage(data?.message || '비밀번호 변경에 실패했습니다.');
        },
      },
    );
  };

  // 비밀번호 변경 모달 렌더링

  // 비밀번호 변경 모달
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={handleClose}
      title="비밀번호 변경"
      width="400px"
    >
      {/* 비밀번호 변경 모달 */}
      <div className={styles.container}>
        {/* 비밀번호 변경 폼 */}
        <div className={styles.inputGroup}>
          <PixelInput
            label="현재 비밀번호"
            type="password"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            fullWidth
          />

          <PixelInput
            label="새 비밀번호"
            type="password"
            name="newPassword"
            placeholder="영문, 숫자, 특수문자 포함 8~16자"
            value={form.newPassword}
            onChange={handleChange}
            fullWidth
          />

          <PixelInput
            label="새 비밀번호 확인"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            fullWidth
          />
        </div>

        {/* 에러 메시지 */}
        {errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}

        <div className={styles.buttonGroup}>
          {/* 취소 버튼 */}
          <PixelButton
            variant="beige"
            onClick={handleClose}
            disabled={isPending}
            className={styles.button}
          >
            취소
          </PixelButton>

          {/* 변경하기 버튼 */}
          <PixelButton
            variant="primary"
            onClick={handleSubmit}
            disabled={
              isPending ||
              !form.oldPassword ||
              !form.newPassword ||
              !form.confirmPassword
            }
            className={styles.button}
          >
            {isPending ? '변경 중...' : '변경하기'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
