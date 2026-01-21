import type { RecipeVariants } from '@vanilla-extract/recipes';

import { container } from './PixelContainer.css';

type ContainerVariants = RecipeVariants<typeof container>;

type PixelContainerProps = React.HTMLAttributes<HTMLDivElement> &
  ContainerVariants & {
    children: React.ReactNode;
    title?: string;
  };

export const PixelContainer = ({
  children,
  variant = 'board',
  title,
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
      {title && (
        <h2
          style={{
            marginTop: '-5px',
            marginBottom: '10px',
            fontSize: '1.5rem',
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          }}
        >
          {title}
        </h2>
      )}

      {children}
    </div>
  );
};
