import clsx from 'clsx'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { BiMenuAltLeft } from 'react-icons/bi'
import { MdLogout } from 'react-icons/md'
import { Button } from './button'

export const SideNav = ({ children }: { children: React.ReactNode }) => {
  const [sideNavOpen, setSideNavOpen] = useState(false)
  return (
    <nav
      className={clsx(
        sideNavOpen ? 'w-64 after:min-w-[256px]' : 'w-14 min-w-[56px]',
        'flex h-full flex-col border-r transition-width'
      )}>
      <Button
        onClick={() => setSideNavOpen(!sideNavOpen)}
        className='rounded-none border-b px-2 py-4 hover:bg-slate-100'>
        <BiMenuAltLeft className='h-6 w-6' />
      </Button>
      <div className='flex h-full w-full flex-col justify-between'>
        <div>{children}</div>
        <div>
          <Button
            className='flex w-full cursor-pointer items-center gap-2 rounded-none border-y py-2 px-2 hover:bg-slate-100'
            onClick={() => {
              signOut()
            }}>
            <MdLogout className='min-h-[24px] min-w-[24px]' />
            {sideNavOpen && <span className='overflow-hidden whitespace-nowrap'>Log Out</span>}
          </Button>
        </div>
      </div>
    </nav>
  )
}
