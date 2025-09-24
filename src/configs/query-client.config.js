import { QueryClient } from '@tanstack/react-query'
// tạo QueryClient với options hợp lý
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnReconnect: true,
      retry: 3,
      staleTime: 5 * 60 * 1000 // 5 phút
    },
    mutations: {
      retry: 2,
      networkMode: 'always'
    },
  },
});