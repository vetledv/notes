import { z } from 'zod'
import { createProtectedRouter } from './protected-router'

export const notesRouter = createProtectedRouter()
  .query('getAll', {
    async resolve({ ctx }) {
      return await ctx.prisma.note.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          updatedAt: 'desc',
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
          status: 'IN_PROGRESS',
          ...input,
        },
      })
    },
  })
  .mutation('trash', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          status: 'TRASHED',
          updatedAt: new Date(),
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
  .mutation('deleteAllTrash', {
    async resolve({ ctx }) {
      return await ctx.prisma.note.deleteMany({
        where: {
          userId: ctx.session.user.id,
          status: 'TRASHED',
        },
      })
    },
  })
