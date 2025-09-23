import { QueryClient } from '@tanstack/react-query'
// tạo QueryClient với options hợp lý
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 phút
    },
    mutations: {
      retry: 0,
    },
  },
});