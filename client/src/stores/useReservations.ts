import { create } from 'zustand'
import { apiGetWithAuth, apiPostWithAuth, apiPutWithAuth, apiDeleteWithAuth } from '../services/apiService'

export interface Reservation {
  id: number
  cotis: string
  reserved_at: string
  completed_at?: string | null
  is_transfered: boolean
  description?: string | null
  location: {
    id: number
    name: string
  }
  vendor: {
    id: number
    name: string
  }
  template?: {
    id: number
    name: string
  } | null
  author: {
    id: number
    name: string
  }
}

export interface ReservationCreate {
  cotis: string
  reserved_at: string
  is_transfered?: boolean
  description?: string | null
  location: number
  vendor: number
  template?: number | null
}

interface ReservationsState {
  reservations: Reservation[]
  selectedReservation: Reservation | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchReservations: (skip?: number, limit?: number, filters?: { user_id?: number, complex_id?: number, vendor_id?: number }, filter?: string) => Promise<void>
  fetchReservationsByMonth: (year: number, month: number, filter?: string) => Promise<void>
  fetchReservation: (id: number) => Promise<void>
  searchReservations: (query: string) => Promise<void>
  createReservation: (reservation: ReservationCreate) => Promise<void>
  updateReservation: (id: number, reservation: Partial<ReservationCreate>) => Promise<void>
  deleteReservation: (id: number) => Promise<void>
  setSelectedReservation: (reservation: Reservation | null) => void
  clearError: () => void
}

export const useReservations = create<ReservationsState>((set) => ({
  reservations: [],
  selectedReservation: null,
  loading: false,
  error: null,

  fetchReservations: async (skip = 0, limit = 100, filters = {}, filter = 'all') => {
    set({ loading: true, error: null })
    try {
      const params: any = { skip, limit }
      if (filters.user_id) params.user_id = filters.user_id
      if (filters.complex_id) params.complex_id = filters.complex_id
      if (filters.vendor_id) params.vendor_id = filters.vendor_id
      if (filter) params.filter = filter

      const response = await apiGetWithAuth('/api/v1/reservations', params)
      console.log('fetchReservations', response)
      if (response.success) {
        set({ reservations: response.data, loading: false })
      } else {
        set({ error: response.message || '접수 목록을 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  fetchReservationsByMonth: async (year: number, month: number, filter = 'all') => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/reservations/by-month/${year}/${month}`, { filter })
      if (response.success) {
        set({ reservations: response.data, loading: false })
      } else {
        set({ error: response.message || '월별 접수 목록을 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  fetchReservation: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/reservations/${id}`)
      if (response.success) {
        set({ selectedReservation: response.data, loading: false })
      } else {
        set({ error: response.message || '접수 정보를 불러오는데 실패했습니다.', loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || '서버에 연결할 수 없습니다.', 
        loading: false 
      })
    }
  },

  searchReservations: async (query: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apiGetWithAuth(`/api/v1/reservations/search/${query}`)
      if (response.success) {
        set({ reservations: response.data, loading: false })
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

  createReservation: async (reservation: ReservationCreate) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPostWithAuth('/api/v1/reservations', reservation)
      if (response.success) {
        const newReservation = response.data
        set((state) => ({ 
          reservations: [...state.reservations, newReservation], 
          loading: false 
        }))
      } else {
        set({ error: response.message || '접수 생성에 실패했습니다.', loading: false })
        throw new Error(response.message || '접수 생성에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  updateReservation: async (id: number, reservation: Partial<ReservationCreate>) => {
    set({ loading: true, error: null })
    try {
      const response = await apiPutWithAuth(`/api/v1/reservations/${id}`, reservation)
      if (response.success) {
        const updatedReservation = response.data
        set((state) => ({
          reservations: state.reservations.map((r) => (r.id === id ? updatedReservation : r)),
          selectedReservation: state.selectedReservation?.id === id ? updatedReservation : state.selectedReservation,
          loading: false,
        }))
      } else {
        set({ error: response.message || '접수 수정에 실패했습니다.', loading: false })
        throw new Error(response.message || '접수 수정에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  deleteReservation: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const response = await apiDeleteWithAuth(`/api/v1/reservations/${id}`)
      if (response.success) {
        set((state) => ({
          reservations: state.reservations.filter((r) => r.id !== id),
          selectedReservation: state.selectedReservation?.id === id ? null : state.selectedReservation,
          loading: false,
        }))
      } else {
        set({ error: response.message || '접수 삭제에 실패했습니다.', loading: false })
        throw new Error(response.message || '접수 삭제에 실패했습니다.')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || '서버에 연결할 수 없습니다.'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  setSelectedReservation: (reservation: Reservation | null) => {
    set({ selectedReservation: reservation })
  },

  clearError: () => {
    set({ error: null })
  },
}))

