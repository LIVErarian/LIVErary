import { QueryClient } from '@tanstack/react-query';

// [중요] export const로 내보내야 GameApp.ts에서 import 가능
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
