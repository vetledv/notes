import { Nav } from './nav'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Nav />
      <main className='w-full flex flex-col min-h-screen'>{children}</main>
    </>
  )
}
export default Layout
