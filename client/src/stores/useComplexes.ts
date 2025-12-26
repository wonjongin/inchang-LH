import { create } from 'zustand'
import { apiGetWithAuth, apiPostWithAuth, apiPutWithAuth, apiDeleteWithAuth } from '../services/apiService'

export interface Complex {
  id: number
  name: string
  address?: string | null
  tel?: string | null
  fax?: string | null
  email?: string | null
}

export interface ComplexCreate {
  name: string
  address?: string | null
  tel?: string | null
  fax?: string | null
  email?: string | null
}

interface ComplexesState {
  complexes: Complex[]
  selectedComplex: Complex | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchComplexes: (skip?: number, limit?: number) => Promise<void>
  fetchComplex: (id: number) => Promise<void>
  searchComplexes: (query: string) => Promise<void>
  createComplex: (complex: ComplexCreate) => Promise<void>
  updateComplex: (id: number, complex: Partial<ComplexCreate>) => Promise<void>
  deleteComplex: (id: number) => Promise<void>
  setSelectedComplex: (complex: Complex | null) => void
  clearError: () => void
}

export const useComplexes = create<ComplexesState>((set) => ({
  complexes: [],
  selectedComplex: null,
  loading: false,
  error: null,

  fetchComplexes: async (skip = 0, limit = 100) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth('/api/v1/complexes', { skip, limit })
      console.log('fetchComplexes', response)
      if (response.success) {
        set({ complexes: response.data, loading: false })
      } else {
        set({ error: response.message || '단지 목록을 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  fetchComplex: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/complexes/${id}`)
      if (response.success) {
        set({ selectedComplex: response.data, loading: false })
      } else {
        set({ error: response.message || '단지 정보를 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  searchComplexes: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/complexes/search/${query}`)
      if (response.success) {
        set({ complexes: response.data, loading: false })
      } else {
        set({ error: response.message || '검색에 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  createComplex: async (complex: ComplexCreate) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPostWithAuth('/api/v1/complexes', complex)
      if (response.success) {
        const newComplex = response.data
        set((state) => ({ 
          complexes: [...state.complexes, newComplex], 
          loading: false 
        }))
      } else {
        set({ error: response.message || '단지 생성에 실패했습니다.', loading: false })
        throw new Error(response.message || '단지 생성에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  updateComplex: async (id: number, complex: Partial<ComplexCreate>) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPutWithAuth(`/api/v1/complexes/${id}`, complex)
      if (response.success) {
        const updatedComplex = response.data
        set((state) => ({
          complexes: state.complexes.map((c) => (c.id === id ? updatedComplex : c)),
          selectedComplex: state.selectedComplex?.id === id ? updatedComplex : state.selectedComplex,
          loading: false,
        }))
      } else {
        set({ error: response.message || '단지 수정에 실패했습니다.', loading: false })
        throw new Error(response.message || '단지 수정에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  deleteComplex: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiDeleteWithAuth(`/api/v1/complexes/${id}`)
      if (response.success) {
        set((state) => ({
          complexes: state.complexes.filter((c) => c.id !== id),
          selectedComplex: state.selectedComplex?.id === id ? null : state.selectedComplex,
          loading: false,
        }))
      } else {
        set({ error: response.message || '단지 삭제에 실패했습니다.', loading: false })
        throw new Error(response.message || '단지 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  setSelectedComplex: (complex: Complex | null) => {
    set({ selectedComplex: complex })
  },

  clearError: () => {
    set({ error: null })
  },
}))

