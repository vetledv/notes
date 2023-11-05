import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { auth } from '~/server/auth'
import { api } from '~/trpc/server'

type NotePageProps = {
	params: {
		note: string
	}
}
export default function NotePage(props: NotePageProps) {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<NotePageContent id={props.params.note} />
		</Suspense>
	)
}

async function NotePageContent({ id }: { id: string }) {
	const session = await auth()
	const note = await api.notes.getAll.query()
	if (!note) {
		return redirect('/')
	}
	return (
		<>
			<div>123</div>
		</>
	)
}
