import type {
  RootState
} from '@/store';

export const selectActiveUsers = (state: RootState) => {
  return state.activeUsers.users;
}