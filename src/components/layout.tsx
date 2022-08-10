import { Nav } from './nav'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className='w-full min-h-screen bg-cyan-200'>
      <Nav />
      <main className='w-full h-[calc(100vh_-_5.039rem)] bg-yellow-200'>{children}</main>
    </div>
  )
}
export default Layout
