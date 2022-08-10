import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

export const notesRouter = createProtectedRouter()
  .query('getAll', {
    async resolve({ ctx }) {
      return await ctx.prisma.note.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      })
    },
  })
  .mutation('create', {
    input: z.object({
      title: z.string(),
      description: z.string().nullish(),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    }),

    async resolve({ ctx, input }) {
      return await ctx.prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...input,
        },
      })
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      })
    },
  })
