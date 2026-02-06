import type { RecipeVariants } from '@vanilla-extract/recipes';

import { pixelButton } from './PixelButton.css';

type ButtonVariants = RecipeVariants<typeof pixelButton>;

// button tag가 원래 가진 속성 & PixelButton.css.ts에서 지정한 속성
type PixelButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants & {
    children: React.ReactNode;
  };

export const PixelButton = ({
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  shape = 'default',
  className,
  style,
  ...props
}: PixelButtonProps) => {
  const finalVariant = disabled ? 'disabled' : variant;
  return (
    <button
      className={`${pixelButton({ size, variant: finalVariant, fullWidth, shape })} ${className || ''}`}
      disabled={disabled}
      style={{ whiteSpace: 'nowrap', ...style }}
      {...props}
    >
      {children}
    </button>
  );
};
