import type { ReactNode } from 'react';

import { modalFooter } from './ModalFooter.css';

type FooterVariant = 'center' | 'space-between' | 'end';

interface ModalFooterProps {
  children: ReactNode;
  variant?: FooterVariant;
}

export const ModalFooter = ({
  children,
  variant = 'center',
}: ModalFooterProps) => {
  return <div className={modalFooter({ variant })}>{children}</div>;
};
