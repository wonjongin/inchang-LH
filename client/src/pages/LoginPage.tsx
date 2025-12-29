import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Message } from 'primereact/message'
import * as stylex from '@stylexjs/stylex'
import { apiPost } from '../services/apiService'

const styles = stylex.create({
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  headerTitle: {
    margin: '0 0 0.5rem 0',
    color: '#333',
    fontSize: '2rem',
  },
  headerSubtitle: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: 500,
    color: '#333',
    fontSize: '0.9rem',
  },
  errorMessage: {
    marginBottom: '0.5rem',
  },
  button: {
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    margin: 0,
    color: '#666',
    fontSize: '0.9rem',
  },
  footerLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
    ':hover': {
      textDecoration: 'underline',
    },
    ':visited': {
      color: '#667eea',
    },
  },
})

export default function LoginPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiPost('/api/v1/auth/login', { name, password })
      if (response.success) {
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('accessTokenExpiredAt', response.data.accessTokenExpiredAt)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        localStorage.setItem('refreshTokenExpiredAt', response.data.refreshTokenExpiredAt)
        navigate('/reservations/list')
      } else {
        setError(response.message || '로그인에 실패했습니다.')
      }
    } catch (err: any) {
      if (err.response.status === 401) {
        setError(err.response.data.detail)
      } else {
        setError('서버에 연결할 수 없습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div {...stylex.props(styles.page)}>
      <Card {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.header)}>
          <h1 {...stylex.props(styles.headerTitle)}>로그인</h1>
          <p {...stylex.props(styles.headerSubtitle)}>계정에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          {error && (
            <Message severity="error" text={error} {...stylex.props(styles.errorMessage)} />
          )}

          <div {...stylex.props(styles.formField)}>
            <label htmlFor="name" {...stylex.props(styles.label)}>이름</label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full"
              required
            />
          </div>

          <div {...stylex.props(styles.formField)}>
            <label htmlFor="password" {...stylex.props(styles.label)}>비밀번호</label>
            <div style={{ width: '100%' }}>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full"
                feedback={false}
                inputStyle={{ width: '100%', maxWidth: 'none' }}
                style={{ width: '100%', maxWidth: 'none' }}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            label="로그인"
            icon="pi pi-sign-in"
            className="w-full"
            {...stylex.props(styles.button)}
            loading={loading}
            disabled={loading}
          />
        </form>

        <div {...stylex.props(styles.footer)}>
          <p {...stylex.props(styles.footerText)}>
            계정이 없으신가요?{' '}
            <Link to="/signup" {...stylex.props(styles.footerLink)}>회원가입</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

