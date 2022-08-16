import { z } from 'zod'
import { createProtectedRouter } from '../protected-router'

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
      id: z.string().cuid(),
      title: z.string().nullable(),
      description: z.string().nullable(),
      color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .optional(),
      status: z.enum(['IN_PROGRESS', 'TRASHED']),
      createdAt: z.date().default(() => new Date()),
      updatedAt: z.date().default(() => new Date()),
    }),

    async resolve({ ctx, input }) {
      return await ctx.prisma.note.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
      })
    },
  })
  .mutation('update', {
    input: z.object({
      id: z.string().min(1),
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      color: z
        .string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .optional(),
    }),

    async resolve({ ctx, input }) {
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
