import { create } from 'zustand'
import { apiGetWithAuth } from '../services/apiService'

export interface Template {
  id: number
  name: string
  cotis_cell?: string | null
  cotis_fmt?: string | null
  reserved_at_cell?: string | null
  reserved_at_fmt?: string | null
  address_cell?: string | null
  address_fmt?: string | null
  description_cell?: string | null
  descriprion_fmt?: string | null
}

interface TemplatesState {
  templates: Template[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchTemplates: (skip?: number, limit?: number) => Promise<void>
  clearError: () => void
}

export const useTemplates = create<TemplatesState>((set) => ({
  templates: [],
  loading: false,
  error: null,

  fetchTemplates: async (skip = 0, limit = 100) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth('/api/v1/templates', { skip, limit })
      if (response.success) {
        set({ templates: response.data, loading: false })
      } else {
        set({ error: response.message || '템플릿 목록을 불러오는데 실패했습니다.', loading: false })
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

