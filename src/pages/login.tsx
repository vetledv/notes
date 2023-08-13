import { signIn } from 'next-auth/react'
import { FaDiscord } from 'react-icons/fa'

import { Button } from '~/components/button'

export default function Login() {
	return (
		<main className='testing flex h-screen flex-col items-center justify-center gap-4'>
			<div className='flex flex-col gap-4'>
				<div>
					<h1 className='w-fit text-7xl font-bold'>Notes.</h1>
					<h2 className='w-fit text-2xl font-bold'>That&apos;s it. Just your notes.</h2>
				</div>
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
			</div>
		</main>
	)
}
