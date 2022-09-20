// src/server/trpc/router/index.ts
import { t } from '../trpc'
import { notesRouter } from './notes'

export const appRouter = t.router({
  notes: notesRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
