'use client'

import { Button } from '~/components/button'
import { api } from '~/trpc/react'
import { NoteFilters } from '~/utils/note-filter'

export function EmptyTrash() {
	const tctx = api.useUtils()
	const { mutate: emptyTrash } = api.notes.deleteAllTrashed.useMutation({
		onMutate: () => {
			tctx.notes.getAll.cancel()
			tctx.notes.getAll.setData(undefined, (oldData) => oldData?.filter((n) => n.status !== NoteFilters.TRASHED))
		},
		onSettled() {
			tctx.notes.getAll.invalidate()
		}
	})
	return (
		<Button
			className='mt-auto h-fit w-full rounded-none border-t bg-white py-4 hover:bg-slate-100'
			onClick={() => emptyTrash()}>
			Empty Trash
		</Button>
	)
}
