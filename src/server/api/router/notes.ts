import { NoteFilters } from '~/utils/note-filter'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const hexColorRegExp = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)

export const notesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.note.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  }),
  create: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        title: z.string().nullable(),
        description: z.string().nullable(),
        color: z.string().regex(hexColorRegExp).optional(),
        status: z.nativeEnum(NoteFilters).optional(),
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        color: z.string().regex(hexColorRegExp).optional(),
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
  trash: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.update({
        where: {
          id: input.id,
        },
        data: {
          status: NoteFilters.TRASHED,
        },
      })
    }),
  deleteOneTrashed: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.note.delete({
        where: {
          id: input.id,
        },
      })
    }),
  deleteAllTrashed: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.prisma.note.deleteMany({
      where: {
        userId: ctx.session.user.id,
        status: NoteFilters.TRASHED,
      },
    })
  }),
})
