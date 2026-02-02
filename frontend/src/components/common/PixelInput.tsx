import * as styles from './PixelInput.css';

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  fullWidth?: boolean;
}

export const PixelInput = ({
  label,
  fullWidth = false,
  className,
  style,
  ...props
}: PixelInputProps) => {
  return (
    <div
      className={`${styles.container} ${className || ''}`}
      style={{ width: fullWidth ? '100%' : 'auto', ...style }}
    >
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputWrapper}>
        <input className={styles.input} {...props} />
      </div>
    </div>
  );
};
