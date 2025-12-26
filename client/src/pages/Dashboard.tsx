import Navbar from '../components/Navbar'
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '2rem',
  },
})

export default function Dashboard() {
  return (
    <div {...stylex.props(styles.page)}>
      <Navbar />
      <div {...stylex.props(styles.content)}>
        <h1>대시보드</h1>
        <p>대시보드 페이지입니다.</p>
      </div>
    </div>
  )
}

