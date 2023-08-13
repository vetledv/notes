export type NoteFilter = (typeof NoteFilters)[keyof typeof NoteFilters]

export const NoteFilters = {
	IN_PROGRESS: 'IN_PROGRESS',
	TRASHED: 'TRASHED'
} as const
