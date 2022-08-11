// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'

import { notesRouter } from './routes/notes'

export const appRouter = createRouter().transformer(superjson).merge('notes.', notesRouter)

// export type definition of API
export type AppRouter = typeof appRouter
