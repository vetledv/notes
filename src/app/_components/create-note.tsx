'use client'

import { createId } from '@paralleldrive/cuid2'
import { type Note } from '@prisma/client'
import { type Session } from 'next-auth/types'
import { TbEdit } from 'react-icons/tb'

import { Button } from '~/components/button'
import { api } from '~/trpc/react'
import { NoteFilters } from '~/utils/note-filter'

export function CreateNote({ session }: { session: Session }) {
	const tctx = api.useUtils()
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
	return (
		<Button
			className='w-fit bg-transparent px-2 py-2 hover:bg-slate-100'
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
	)
}
