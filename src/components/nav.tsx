import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/future/image'
import { useState } from 'react'
import { FaDiscord } from 'react-icons/fa'
import { MdLogout, MdOutlineMoreVert } from 'react-icons/md'
import { Button } from './button'

export const SignInOrOut: React.FC = () => {
  const session = useSession()
  if (session.data) {
    return (
      <Button
        onClick={() => {
          signOut()
        }}>
        Sign out
      </Button>
    )
  }
  return (
    <Button
      onClick={() => {
        signIn('discord')
      }}
      className='flex gap-2 items-center bg-[#37393e] text-[#dcddde]'>
      Log in with Discord
      <span>
        <FaDiscord className='h-6 w-6' />
      </span>
    </Button>
  )
}

export const Nav = () => {
  const session = useSession()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav className='bg-slate-100 border-b sticky p-2 inset-0 z-50'>
      <div className='flex gap-4 items-center'>
        {session.data?.user?.image ? (
          <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400'>
            <Image src={session.data.user.image} width={100} height={100} alt={'Profile Picture'} />
          </div>
        ) : null}
        <div>{session.data?.user?.name}</div>
        <div className='cursor-pointer p-1 hover:bg-slate-200 rounded-full' onClick={() => setIsOpen(!isOpen)}>
          <MdOutlineMoreVert className='w-6 h-6' />
        </div>
      </div>
      {isOpen && (
        <div className='absolute top-14 z-50 w-48 p-2 bg-slate-100 shadow-md'>
          <Button
            className='w-full cursor-pointer items-center flex justify-center gap-2 hover:bg-slate-200'
            onClick={() => {
              signOut()
            }}>
            Log Out
            <MdLogout className="w-6 h-6" />
          </Button>
        </div>
      )}
    </nav>
  )
}
