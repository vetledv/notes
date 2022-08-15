interface Props {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className='min-h-screen w-full'>
      <main className='h-screen w-full'>{children}</main>
    </div>
  )
}
export default Layout
