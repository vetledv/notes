import { signIn } from 'next-auth/react'
import { FaDiscord } from 'react-icons/fa'
import { Button } from './button'

const Login = () => {
  return (
    <div className='flex flex-col h-screen items-center gap-4 justify-center testing'>
      <div className='flex flex-col gap-4'>
        <div>
          <div className='text-7xl font-bold border-b w-fit'>Notes.</div>
          <div className='text-2xl font-bold border-b w-fit'>That&apos;s it. Just your notes.</div>
        </div>
        <Button
          onClick={() => {
            signIn('discord')
          }}
          className='flex text-lg gap-2 w-fit py-4 justify-center items-center bg-[#37393e] text-[#dcddde]'>
          Log in with Discord
          <FaDiscord className='h-6 w-6' />
        </Button>
      </div>
    </div>
  )
}

export default Login
