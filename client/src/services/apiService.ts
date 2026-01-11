import axios from 'axios'

const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export default apiService

async function apiGet(path: string, params: any = {}): Promise<any> {
  const response = await apiService.get(path, { params })
  return response.data
}

async function apiPost(path: string, data: any = {}): Promise<any> {
  const response = await apiService.post(path, data)
  return response.data
}

async function apiPut(path: string, data: any = {}): Promise<any> {
  const response = await apiService.put(path, data)
  return response.data
}

async function apiDelete(path: string): Promise<any> {
  const response = await apiService.delete(path)
  return response.data
}

async function apiGetWithAuth(path: string, params: any = {}): Promise<any> {
  try {
    const accessToken = localStorage.getItem('accessToken')?.trim()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
    }
    const response = await apiService.get(path, { params, headers: { Authorization: `Bearer ${accessToken}` } })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('accessTokenExpiredAt')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiredAt')

      const refreshResponse = await apiPost('/api/v1/auth/refresh', { refreshToken })
      if (refreshResponse.success) {
        localStorage.setItem('accessToken', refreshResponse.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', refreshResponse.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', refreshResponse.data.refreshTokenExpiredAt)
        return await apiGetWithAuth(path, params)
      }
      throw new Error('인증 정보를 확인할 수 없습니다.')
    }
    throw error
  }
}

async function apiPostWithAuth(path: string, data: any = {}): Promise<any> {
  try {
    const accessToken = localStorage.getItem('accessToken')?.trim()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
    }
    const response = await apiService.post(path, data, { headers: { Authorization: `Bearer ${accessToken}` } })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('accessTokenExpiredAt')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiredAt')
      const refreshResponse = await apiPost('/api/v1/auth/refresh', { refreshToken })
      if (refreshResponse.success) {
        localStorage.setItem('accessToken', refreshResponse.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', refreshResponse.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', refreshResponse.data.refreshTokenExpiredAt)
        return await apiPostWithAuth(path, data)
      }
      throw new Error('인증 정보를 확인할 수 없습니다.')
    }
    throw error
  }
}

async function apiPostWithAuthFormData(path: string, formData: FormData): Promise<any> {
  try {
    const accessToken = localStorage.getItem('accessToken')?.trim()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
    }
    const response = await apiService.post(path, formData, { headers: { Authorization: `Bearer ${accessToken}` } })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('accessTokenExpiredAt')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiredAt')
      const refreshResponse = await apiPost('/api/v1/auth/refresh', { refreshToken })
      if (refreshResponse.success) {
        localStorage.setItem('accessToken', refreshResponse.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', refreshResponse.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', refreshResponse.data.refreshTokenExpiredAt)
        return await apiPostWithAuthFormData(path, formData)
      }
      throw new Error('인증 정보를 확인할 수 없습니다.')
    }
    throw error
  }
  }

async function apiPutWithAuth(path: string, data: any = {}): Promise<any> {
  try {
    const accessToken = localStorage.getItem('accessToken')?.trim()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
    }
    const response = await apiService.put(path, data, { headers: { Authorization: `Bearer ${accessToken}` } })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('accessTokenExpiredAt')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiredAt')
      const refreshResponse = await apiPost('/api/v1/auth/refresh', { refreshToken })
      if (refreshResponse.success) {
        localStorage.setItem('accessToken', refreshResponse.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', refreshResponse.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', refreshResponse.data.refreshTokenExpiredAt)
        return await apiPutWithAuth(path, data)
      }
      throw new Error('인증 정보를 확인할 수 없습니다.')
    }
    throw error
  }
}

async function apiDeleteWithAuth(path: string): Promise<any> {
  try {
    const accessToken = localStorage.getItem('accessToken')?.trim()
    if (!accessToken) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.')
    }
    const response = await apiService.delete(path, { headers: { Authorization: `Bearer ${accessToken}` } })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('accessTokenExpiredAt')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('refreshTokenExpiredAt')
      const refreshResponse = await apiPost('/api/v1/auth/refresh', { refreshToken })
      if (refreshResponse.success) {
        localStorage.setItem('accessToken', refreshResponse.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', refreshResponse.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', refreshResponse.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', refreshResponse.data.refreshTokenExpiredAt)
        return await apiDeleteWithAuth(path)
      }
      throw new Error('인증 정보를 확인할 수 없습니다.')
    }
    throw error
  }
}

export { apiGet, apiPost, apiPut, apiDelete, apiGetWithAuth, apiPostWithAuth, apiPutWithAuth, apiDeleteWithAuth, apiPostWithAuthFormData }