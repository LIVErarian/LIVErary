import { useState } from 'react';

import { PixelButton } from '@/components/common/PixelButton';
import { PixelInput } from '@/components/common/PixelInput';
import { PixelModal } from '@/components/common/PixelModal';
import { useResetPassword } from '@/hooks/queries/useAuth';
import { useModalStore } from '@/store/useModalStore';

import * as styles from './PasswordResetModal.css';

export const PasswordResetModal = () => {
  const { currentModal, closeModal } = useModalStore();
  const isOpen = currentModal === 'passwordReset';

  const { mutate: resetPassword, isPending } = useResetPassword();

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrorMessage('');
    closeModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage('모든 항목을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorMessage(
        '비밀번호는 8~16자 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.',
      );
      return;
    }

    resetPassword(
      { oldPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          alert('비밀번호가 변경되었습니다.');
          handleClose();
        },
        onError: () => {
          setErrorMessage(
            '비밀번호 변경에 실패했습니다. 기존 비밀번호를 확인해주세요.',
          );
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={handleClose}
      title="비밀번호 변경"
      width="400px"
    >
      <div className={styles.container}>
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

        {errorMessage && (
          <span className={styles.errorMessage}>{errorMessage}</span>
        )}

        <div className={styles.buttonGroup}>
          <PixelButton
            variant="beige"
            onClick={handleClose}
            disabled={isPending}
            size="sm"
          >
            취소
          </PixelButton>
          <PixelButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending}
            size="sm"
          >
            {isPending ? '변경 중...' : '변경하기'}
          </PixelButton>
        </div>
      </div>
    </PixelModal>
  );
};
