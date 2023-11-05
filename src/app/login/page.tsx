import { SignInButton } from '~/app/login/sign-in-button'

export const runtime = 'edge'

export default function Login() {
	return (
		<main className='testing flex h-screen flex-col items-center justify-center gap-4'>
			<div className='flex flex-col gap-4'>
				<div>
					<h1 className='w-fit text-7xl font-bold'>Notes.</h1>
					<h2 className='w-fit text-2xl font-bold'>That&apos;s it. Just your notes.</h2>
				</div>
				<SignInButton />
			</div>
		</main>
	)
}
