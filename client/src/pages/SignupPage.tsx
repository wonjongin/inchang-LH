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
  successMessage: {
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

export default function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [adminPw, setAdminPw] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요.')
      return false
    }

    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.')
      return false
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await apiPost('/api/v1/users', { name, password, "admin_pw": adminPw })
      if (response.success) {
        setSuccess('회원가입이 완료되었습니다!')
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        setError(response.message || '회원가입에 실패했습니다.')
      }
    } catch (err: any) {
      if (err.response.data.detail) {
        setError(err.response.data.detail)
      } else {
        setError('회원가입에 실패했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div {...stylex.props(styles.page)}>
      <Card {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.header)}>
          <h1 {...stylex.props(styles.headerTitle)}>회원가입</h1>
          <p {...stylex.props(styles.headerSubtitle)}>새 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} {...stylex.props(styles.form)}>
          {error && (
            <Message severity="error" text={error} {...stylex.props(styles.errorMessage)} />
          )}

          {success && (
            <Message severity="success" text={success} {...stylex.props(styles.successMessage)} />
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
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (최소 4자)"
              className="w-full"
              feedback
              inputStyle={{ width: '100%', maxWidth: 'none' }}
              style={{ width: '100%', maxWidth: 'none' }}
              required
            />
          </div>

          <div {...stylex.props(styles.formField)}>
            <label htmlFor="confirmPassword" {...stylex.props(styles.label)}>비밀번호 확인</label>
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full"
              feedback={false}
              inputStyle={{ width: '100%', maxWidth: 'none' }}
              style={{ width: '100%', maxWidth: 'none' }}
              required
            />
          </div>

          <div {...stylex.props(styles.formField)}>
            <label htmlFor="adminPw" {...stylex.props(styles.label)}>관리자 비밀번호</label>
            <Password
              id="adminPw"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              placeholder="관리자 비밀번호를 입력하세요"
              className="w-full"
              feedback={false}
              inputStyle={{ width: '100%', maxWidth: 'none' }}
              style={{ width: '100%', maxWidth: 'none' }}
              required
            />
          </div>
          <Button
            type="submit"
            label="회원가입"
            icon="pi pi-user-plus"
            className="w-full"
            {...stylex.props(styles.button)}
            loading={loading}
            disabled={loading}
          />
        </form>

        <div {...stylex.props(styles.footer)}>
          <p {...stylex.props(styles.footerText)}>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" {...stylex.props(styles.footerLink)}>로그인</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

