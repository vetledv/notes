import type { Note } from '@prisma/client'
import type { GetServerSidePropsContext, NextPage } from 'next'

import cuid from 'cuid'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRef, useState } from 'react'

//icons
import { BiSearchAlt } from 'react-icons/bi'
import { HiOutlineTrash } from 'react-icons/hi'
import { TbEdit, TbNotes } from 'react-icons/tb'

import AutoAnimate from '@/components/auto-animate'
import { Button } from '@/components/button'
import LoadingSkeleton from '@/components/loading-skeleton'
import Login from '@/components/login'
import NoteEditor from '@/components/note-editor'
import NoteTile from '@/components/note-tile'
import SideNav from '@/components/sidenav'
import useWindowResize from '@/hooks/use-window-resize'
import { trpc } from '@/utils/trpc'
import { getServerAuthSession } from '@server/unstable-get-session'

const HomeContent: React.FC = () => {
  const session = useSession()
  const tctx = trpc.useContext()

  const { data: notes } = trpc.notes.getAll.useQuery(undefined, {
    enabled: session.status === 'authenticated',
  })

  const createTodo = trpc.notes.create.useMutation({
    onMutate(variables) {
      tctx.notes.getAll.cancel()
      const newNote = {
        ...variables,
        userId: session!.data!.user!.id,
      } as Note
      tctx.notes.getAll.setData((data: Note[]) => {
        if (!data) return [newNote]
        return [newNote, ...data]
      })
    },
  })

  const { mutate: emptyTrash } = trpc.notes.deleteAllTrashed.useMutation({
    onMutate: () => {
      tctx.notes.getAll.cancel()
      tctx.notes.getAll.setData((oldData: any) => oldData!.filter((n: { status: string }) => n.status !== 'TRASHED'))
    },
    onSettled() {
      tctx.notes.getAll.invalidate()
    },
  })

  const windowSize = useWindowResize([])
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [noteFilter, setNoteFilter] = useState<'IN_PROGRESS' | 'TRASHED'>('IN_PROGRESS')
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    createTodo.mutate({
      id: cuid(),
      title: 'New Note',
      description: '',
      color: '#D8E2DC',
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const notesByStatus = () => {
    if (!notes) return []
    return notes.filter((note) => note.status === noteFilter)
  }

  const renderNoteEditor = () => {
    if (!notes) return null
    return notes
      .filter((note) => note.id === activeNote)
      .map((note) => <NoteEditor key={note.id} note={note} setOpenNote={setActiveNote} />)
  }

  if (!session.data) return <Login />
  if (!notes) return <LoadingSkeleton />

  return (
    <div
      style={{
        height: windowSize.height,
      }}
      className='box-border flex w-full overflow-hidden'>
      <SideNav>
        <Button
          onClick={() => setNoteFilter('IN_PROGRESS')}
          className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
          <TbNotes className='min-h-[24px] min-w-[24px]' />
          <span className='overflow-hidden whitespace-nowrap'>All Notes</span>
        </Button>
        <Button
          onClick={() => setNoteFilter('TRASHED')}
          className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
          <HiOutlineTrash className='min-h-[24px] min-w-[24px]' />
          <span className='overflow-hidden whitespace-nowrap'>Trash</span>
        </Button>
      </SideNav>

      <div className='relative flex h-full w-full flex-col md:w-80 md:min-w-[320px] md:max-w-xs md:border-r lg:w-96 lg:min-w-[384px] lg:max-w-sm'>
        <div className='flex items-center justify-between border-b p-2'>
          <div className='w-full text-center'>{noteFilter === 'IN_PROGRESS' ? 'My notes' : 'Trash'}</div>
          <Button className='w-fit bg-transparent px-2 py-2' disabled={createTodo.isLoading} onClick={handleCreateTodo}>
            <TbEdit className='h-6 w-6' />
          </Button>
        </div>
        <span onClick={() => searchRef.current?.focus()} className='relative cursor-text'>
          <BiSearchAlt className='absolute inset-y-0 left-4 my-auto h-6 w-6' />
          <input
            ref={searchRef}
            className='w-full border-b py-2 pl-12 pr-4 outline-none placeholder:italic'
            placeholder='Search notes (not implemented)'
          />
        </span>
        <AutoAnimate className='relative flex h-full max-h-full w-full flex-col overflow-y-auto'>
          {notesByStatus().length > 0 ? (
            notesByStatus().map((note) => <NoteTile key={note.id} note={note} onClick={() => setActiveNote(note.id)} />)
          ) : (
            <div className='m-auto'>
              {noteFilter === 'IN_PROGRESS' ? <div>You have no notes</div> : <div>Trash empty</div>}
            </div>
          )}
        </AutoAnimate>
        {noteFilter === 'TRASHED' && (
          <Button
            className='mt-auto h-fit w-full rounded-none border-t bg-white py-4 hover:bg-slate-100'
            onClick={() => emptyTrash()}>
            Empty Trash
          </Button>
        )}
      </div>
      {renderNoteEditor()}
    </div>
  )
}

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Todo Notes</title>
        <meta name='description' content='Make todo post-it notes' />
      </Head>
      <HomeContent />
    </>
  )
}

//unstable get session for improved load performance
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerAuthSession(ctx),
    },
  }
}

export default Home
