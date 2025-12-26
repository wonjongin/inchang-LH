import { create } from 'zustand'
import { apiGetWithAuth, apiPostWithAuth, apiPutWithAuth, apiDeleteWithAuth } from '../services/apiService'

export interface Vendor {
  id: number
  name: string
  tel?: string | null
  fax?: string | null
  email?: string | null
  control_range?: string | null
  template?: number | null
}

export interface VendorCreate {
  name: string
  tel?: string | null
  fax?: string | null
  email?: string | null
  control_range?: string | null
  template?: number | null
}

interface VendorsState {
  vendors: Vendor[]
  selectedVendor: Vendor | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchVendors: (skip?: number, limit?: number, templateId?: number) => Promise<void>
  fetchVendor: (id: number) => Promise<void>
  searchVendors: (query: string) => Promise<void>
  createVendor: (vendor: VendorCreate) => Promise<void>
  updateVendor: (id: number, vendor: Partial<VendorCreate>) => Promise<void>
  deleteVendor: (id: number) => Promise<void>
  setSelectedVendor: (vendor: Vendor | null) => void
  clearError: () => void
}

export const useVendors = create<VendorsState>((set) => ({
  vendors: [],
  selectedVendor: null,
  loading: false,
  error: null,

  fetchVendors: async (skip = 0, limit = 100, templateId) => {
    set({ loading: true, error: null })
    try {
      const params: any = { skip, limit }
      if (templateId) {
        params.template_id = templateId
      }
      const response = await apiGetWithAuth('/api/v1/vendors', params)
      console.log('fetchVendors', response)
      if (response.success) {
        set({ vendors: response.data, loading: false })
      } else {
        set({ error: response.message || '업체 목록을 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  fetchVendor: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/vendors/${id}`)
      if (response.success) {
        set({ selectedVendor: response.data, loading: false })
      } else {
        set({ error: response.message || '업체 정보를 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  searchVendors: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/vendors/search/${query}`)
      if (response.success) {
        set({ vendors: response.data, loading: false })
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

  createVendor: async (vendor: VendorCreate) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPostWithAuth('/api/v1/vendors', vendor)
      if (response.success) {
        const newVendor = response.data
        set((state) => ({ 
          vendors: [...state.vendors, newVendor], 
          loading: false 
        }))
      } else {
        set({ error: response.message || '업체 생성에 실패했습니다.', loading: false })
        throw new Error(response.message || '업체 생성에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  updateVendor: async (id: number, vendor: Partial<VendorCreate>) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPutWithAuth(`/api/v1/vendors/${id}`, vendor)
      if (response.success) {
        const updatedVendor = response.data
        set((state) => ({
          vendors: state.vendors.map((v) => (v.id === id ? updatedVendor : v)),
          selectedVendor: state.selectedVendor?.id === id ? updatedVendor : state.selectedVendor,
          loading: false,
        }))
      } else {
        set({ error: response.message || '업체 수정에 실패했습니다.', loading: false })
        throw new Error(response.message || '업체 수정에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  deleteVendor: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiDeleteWithAuth(`/api/v1/vendors/${id}`)
      if (response.success) {
        set((state) => ({
          vendors: state.vendors.filter((v) => v.id !== id),
          selectedVendor: state.selectedVendor?.id === id ? null : state.selectedVendor,
          loading: false,
        }))
      } else {
        set({ error: response.message || '업체 삭제에 실패했습니다.', loading: false })
        throw new Error(response.message || '업체 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  setSelectedVendor: (vendor: Vendor | null) => {
    set({ selectedVendor: vendor })
  },

  clearError: () => {
    set({ error: null })
  },
}))

