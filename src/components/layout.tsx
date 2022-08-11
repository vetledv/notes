import { Nav } from './nav'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className='w-full min-h-screen'>
      <main className='w-full h-screen'>{children}</main>
    </div>
  )
}
export default Layout
