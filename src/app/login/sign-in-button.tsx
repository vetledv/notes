'use client'

import { signIn } from 'next-auth/react'
import { FaDiscord } from 'react-icons/fa'

import { Button } from '~/components/button'

export function SignInButton() {
	return (
		<Button
			onClick={() => {
				signIn('discord', {
					callbackUrl: '/'
				})
			}}
			className='flex w-fit items-center justify-center gap-2 bg-[#37393e] py-4 text-lg text-[#dcddde]'>
			Log in with Discord
			<FaDiscord className='h-6 w-6' />
		</Button>
	)
}
