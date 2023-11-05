'use client'

import { useState } from 'react'
import { createId } from '@paralleldrive/cuid2'
import { type Note } from '@prisma/client'
import { Session } from 'next-auth'
import { HiOutlineTrash } from 'react-icons/hi'
import { TbEdit, TbNotes } from 'react-icons/tb'

import { AutoAnimate } from '~/components/auto-animate'
import { Button } from '~/components/button'
import { LoadingSkeleton } from '~/components/loading-skeleton'
import { NoteEditor } from '~/components/note-editor'
import { NoteTile } from '~/components/note-tile'
import { SideNav } from '~/components/sidenav'
import { useWindowResize } from '~/hooks/use-window-resize'
import { api } from '~/trpc/react'
import { NoteFilter, NoteFilters } from '~/utils/note-filter'

export function HomeContent({ session }: { session: Session }) {
	const tctx = api.useUtils()

	const notesQuery = api.notes.getAll.useQuery()

	const createTodo = api.notes.create.useMutation({
		onMutate(variables) {
			tctx.notes.getAll.cancel()
			if (!session.user.id) {
				throw new Error('User not authenticated')
			}
			const newNote = {
				...variables,
				color: variables.color || '#D8E2DC',
				status: NoteFilters.IN_PROGRESS,
				createdAt: new Date(),
				updatedAt: new Date(),
				userId: session.user.id
			} satisfies Note

			tctx.notes.getAll.setData(undefined, (oldData) => {
				return oldData ? [newNote, ...oldData] : [newNote]
			})
		}
	})

	const { mutate: emptyTrash } = api.notes.deleteAllTrashed.useMutation({
		onMutate: () => {
			tctx.notes.getAll.cancel()
			tctx.notes.getAll.setData(undefined, (oldData) => oldData?.filter((n) => n.status !== NoteFilters.TRASHED))
		},
		onSettled() {
			tctx.notes.getAll.invalidate()
		}
	})

	const windowSize = useWindowResize([])
	const [activeNote, setActiveNote] = useState<string | null>(null)
	const [noteFilter, setNoteFilter] = useState<NoteFilter>(NoteFilters.IN_PROGRESS)

	if (notesQuery.isError) return <div>Failed to load notes: {notesQuery.error.message}</div>
	if (notesQuery.isLoading || !notesQuery.data) return <LoadingSkeleton />

	return (
		<div style={{ height: windowSize.height }} className='box-border flex w-full overflow-hidden'>
			<SideNav>
				<Button
					onClick={() => setNoteFilter(NoteFilters.IN_PROGRESS)}
					className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
					<TbNotes className='min-h-[24px] min-w-[24px]' />
					<p className='overflow-hidden whitespace-nowrap'>All Notes</p>
				</Button>
				<Button
					onClick={() => setNoteFilter(NoteFilters.TRASHED)}
					className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
					<HiOutlineTrash className='min-h-[24px] min-w-[24px]' />
					<p className='overflow-hidden whitespace-nowrap'>Trash</p>
				</Button>
			</SideNav>
			<aside className='relative flex h-full w-full flex-col md:w-80 md:min-w-[320px] md:max-w-xs md:border-r lg:w-96 lg:min-w-[384px] lg:max-w-sm'>
				<div className='flex items-center justify-between border-b p-2'>
					<p className='w-full text-center'>{noteFilter === NoteFilters.IN_PROGRESS ? 'My notes' : 'Trash'}</p>
					<Button
						className='w-fit bg-transparent px-2 py-2'
						disabled={createTodo.isLoading}
						onClick={() => {
							createTodo.mutate({
								id: createId(),
								title: 'New Note',
								description: '',
								color: '#D8E2DC',
								status: NoteFilters.IN_PROGRESS,
								createdAt: new Date(),
								updatedAt: new Date()
							})
						}}>
						<TbEdit className='h-6 w-6' />
					</Button>
				</div>
				<AutoAnimate className='relative flex h-full max-h-full w-full flex-col overflow-y-auto'>
					{notesQuery.data.filter((note) => note.status === noteFilter).length > 0 ? (
						notesQuery.data
							.filter((note) => note.status === noteFilter)
							.map((note) => <NoteTile key={note.id} note={note} onClick={() => setActiveNote(note.id)} />)
					) : (
						<div className='m-auto'>
							{noteFilter === NoteFilters.IN_PROGRESS ? <div>You have no notes</div> : <div>Trash empty</div>}
						</div>
					)}
				</AutoAnimate>
				{noteFilter === NoteFilters.TRASHED && (
					<Button
						className='mt-auto h-fit w-full rounded-none border-t bg-white py-4 hover:bg-slate-100'
						onClick={() => emptyTrash()}>
						Empty Trash
					</Button>
				)}
			</aside>
			{notesQuery.data
				.filter((note) => note.id === activeNote)
				.map((note) => (
					<NoteEditor key={note.id} note={note} onClose={() => setActiveNote(null)} />
				))}
		</div>
	)
}
