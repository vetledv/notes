import { Nav } from './nav'

interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Nav />

      <main className='container mx-auto flex flex-col min-h-screen p-4'>{children}</main>
    </>
  )
}
export default Layout
