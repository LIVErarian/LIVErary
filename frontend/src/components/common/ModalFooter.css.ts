import { recipe } from '@vanilla-extract/recipes';

// Footer 내부 정렬
export const modalFooter = recipe({
  base: {
    display: 'flex',
    width: '100%',
    gap: '16px',
  },

  variants: {
    variant: {
      center: { justifyContent: 'center' },
      'space-between': { justifyContent: 'space-between' },
      end: { justifyContent: 'flex-end' },
    },
  },

  defaultVariants: {
    variant: 'center',
  },
});
