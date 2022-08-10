// src/server/router/index.ts
import { createRouter } from './context'
import superjson from 'superjson'

import { exampleRouter } from './example'
import { notesRouter } from './notes'

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('example.', exampleRouter)
  .merge('notes.', notesRouter)

// export type definition of API
export type AppRouter = typeof appRouter
