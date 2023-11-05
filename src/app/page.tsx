import { redirect } from 'next/navigation'

import { HomeContent } from '~/app/_home-content'
import { getServerAuthSession } from '~/server/auth'

export const runtime = 'edge'

export default async function HomePage() {
	const session = await getServerAuthSession()
	if (!session) {
		return redirect('/login')
	}
	return (
		<>
			<HomeContent session={session} />
		</>
	)
}
