import { TRPCError } from '@trpc/server'
import { t } from '../trpc'

/**
 * Creates a tRPC router that asserts all queries and mutations are from an authorized user. Will throw an unauthorized error if a user is not signed in.
 */
const hasSession = t.middleware(async ({ next, ctx }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})
export const userProtectedProcedure = t.procedure.use(hasSession)
