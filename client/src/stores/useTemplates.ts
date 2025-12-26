import { create } from 'zustand'
import { apiGetWithAuth, apiPutWithAuth, apiDeleteWithAuth } from '../services/apiService'

export interface Template {
  id: number
  name: string
  fmt: string
}

export interface TemplateCreate {
  name: string
  fmt: string
  file?: File | null
}

interface TemplatesState {
  templates: Template[]
  selectedTemplate: Template | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchTemplates: (skip?: number, limit?: number) => Promise<void>
  fetchTemplate: (id: number) => Promise<void>
  createTemplate: (template: TemplateCreate) => Promise<void>
  updateTemplate: (id: number, template: Partial<TemplateCreate>) => Promise<void>
  deleteTemplate: (id: number) => Promise<void>
  setSelectedTemplate: (template: Template | null) => void
  clearError: () => void
}

export const useTemplates = create<TemplatesState>((set) => ({
  templates: [],
  selectedTemplate: null,
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

  fetchTemplate: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/templates/${id}`)
      if (response.success) {
        set({ selectedTemplate: response.data, loading: false })
      } else {
        set({ error: response.message || '템플릿 정보를 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  createTemplate: async (template: TemplateCreate) => {
    set({ loading: true, error: null })
    try {
      // FormData 생성 (파일 업로드용)
      const formData = new FormData()
      formData.append('name', template.name)
      if (template.fmt) formData.append('fmt', template.fmt)
      if (template.file) formData.append('file', template.file)

      const accessToken = localStorage.getItem('accessToken')?.trim()
      if (!accessToken) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        const newTemplate = data.data
        set((state) => ({ 
          templates: [...state.templates, newTemplate], 
          loading: false 
        }))
      } else {
        set({ error: data.message || '템플릿 생성에 실패했습니다.', loading: false })
        throw new Error(data.message || '템플릿 생성에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  updateTemplate: async (id: number, template: Partial<TemplateCreate>) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPutWithAuth(`/api/v1/templates/${id}`, template)
      if (response.success) {
        const updatedTemplate = response.data
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? updatedTemplate : t)),
          selectedTemplate: state.selectedTemplate?.id === id ? updatedTemplate : state.selectedTemplate,
          loading: false,
        }))
      } else {
        set({ error: response.message || '템플릿 수정에 실패했습니다.', loading: false })
        throw new Error(response.message || '템플릿 수정에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  deleteTemplate: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiDeleteWithAuth(`/api/v1/templates/${id}`)
      if (response.success) {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
          loading: false,
        }))
      } else {
        set({ error: response.message || '템플릿 삭제에 실패했습니다.', loading: false })
        throw new Error(response.message || '템플릿 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  setSelectedTemplate: (template: Template | null) => {
    set({ selectedTemplate: template })
  },

  clearError: () => {
    set({ error: null })
  },
}))

