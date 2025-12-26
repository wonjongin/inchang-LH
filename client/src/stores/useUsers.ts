import { create } from 'zustand'
import { apiGetWithAuth } from '../services/apiService'

export interface User {
  id: number
  name: string
}

interface UsersState {
  users: User[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchUsers: (skip?: number, limit?: number) => Promise<void>
  clearError: () => void
}

export const useUsers = create<UsersState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async (skip = 0, limit = 100) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth('/api/v1/users', { skip, limit })
      if (response.success) {
        set({ users: response.data, loading: false })
      } else {
        set({ error: response.message || '사용자 목록을 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

