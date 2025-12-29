import { create } from 'zustand'
import { apiGetWithAuth } from '../services/apiService'

export interface User {
  id: number
  name: string
  permission: number
}

interface UsersState {
  me: User | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchMe: () => Promise<void>
  clearError: () => void
}

export const useUsers = create<UsersState>((set) => ({
  me: null,
  loading: false,
  error: null,

  fetchMe: async () => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth('/api/v1/users/me')
      if (response.success) {
        set({ me: response.data, loading: false })
      } else {
        set({ error: response.message || '내 정보를 불러오는데 실패했습니다.', loading: false })
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

