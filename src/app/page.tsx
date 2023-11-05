import { redirect } from 'next/navigation'

import { HomeContent } from '~/app/_home-content'
import { auth } from '~/server/auth'

export default async function HomePage() {
	const session = await auth()
	if (!session) {
		return redirect('/login')
	}
	return (
		<>
			<HomeContent session={session} />
		</>
	)
}
