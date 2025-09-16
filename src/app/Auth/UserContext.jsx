import { createContext, useContext } from 'react';

export const UserContext = createContext({
  user: {
    userId: '',
    email: '',
    firstName: '',
    lastName: ''
  },
  setUser: () => {}
});

export function useUser() {
  return useContext(UserContext);
}
