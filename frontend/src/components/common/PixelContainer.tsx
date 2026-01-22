import type { RecipeVariants } from '@vanilla-extract/recipes';

import { container } from './PixelContainer.css';

type ContainerVariants = RecipeVariants<typeof container>;

type PixelContainerProps = React.HTMLAttributes<HTMLDivElement> &
  ContainerVariants & {
    children: React.ReactNode;
    header?: React.ReactNode;
  };

export const PixelContainer = ({
  children,
  variant = 'board',
  header,
  className,
  style,
  ...props
}: PixelContainerProps) => {
  return (
    <div
      className={`${container({ variant })} ${className || ''}`}
      style={style}
      {...props}
    >
      {/* 제목이 있으면 상단에 표시 */}
      {header && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {typeof header === 'string' ? (
            // 문자열이면 h2로 생성
            <h2
              style={{
                margin: 0,
                fontSize: '1.5rem',
                textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
              }}
            >
              {header}
            </h2>
          ) : (
            // 이미지면 그대로
            header
          )}
        </div>
      )}

      {children}
    </div>
  );
};
