import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/future/image'
import { FaDiscord } from 'react-icons/fa'
import { Button } from './button'

const SignInOrOut: React.FC = () => {
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
  return (
    <nav className='bg-slate-100 p-4 border-b sticky inset-0'>
      <div className='flex gap-4 items-center'>
        {session.data?.user?.image ? (
          <div className='w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400'>
            <Image src={session.data.user.image} width={100} height={100} alt={'Profile Picture'} />
          </div>
        ) : null}
        <div>{session.data?.user?.name}</div>
        <SignInOrOut />
      </div>
    </nav>
  )
}
