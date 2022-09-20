import { z } from 'zod'
import { t } from '../trpc'
import { userProtectedProcedure } from './protected-router'

export const notesRouter = t.router({
  getAll: userProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }),
  create: userProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().nullable(),
        description: z.string().nullable(),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          .optional(),
        status: z.enum(['IN_PROGRESS', 'TRASHED']).optional(),
        createdAt: z.date().default(() => new Date()),
        updatedAt: z.date().default(() => new Date()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          status: input.status || 'IN_PROGRESS',
          ...input,
        },
      })
    }),
  update: userProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        color: z
          .string()
          .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          description: input.description,
          color: input.color,
        },
      })
    }),
  trash: userProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          status: 'TRASHED',
        },
      })
    }),
  deleteOneTrashed: userProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      })
    }),
  deleteAllTrashed: userProtectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.prisma.note.deleteMany({
      where: {
        userId: ctx.session.user.id,
        status: 'TRASHED',
      },
    })
  }),
})
