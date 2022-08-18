import type { Note } from '@prisma/client'
import type { NextPage } from 'next'
import type { GetServerSidePropsContext } from 'next'

import clsx from 'clsx'
import cuid from 'cuid'
import { signOut, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { z } from 'zod'

//icons
import { AiOutlineLoading3Quarters, AiOutlinePlus } from 'react-icons/ai'
import { BiMenuAltLeft, BiSearchAlt } from 'react-icons/bi'
import { FaTrash } from 'react-icons/fa'
import { HiOutlineTrash } from 'react-icons/hi'
import { MdLogout } from 'react-icons/md'
import { TbEdit, TbNotes } from 'react-icons/tb'

import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import Login from '../components/login'
import NoteTile from '../components/note-tile'
import { trpc } from '../utils/trpc'
import { getUnstableSession } from './../server/unstable-get-session'

const HomeContent: React.FC = () => {
  const session = useSession()
  const tctx = trpc.useContext()

  const notes = trpc.useQuery(['notes.getAll'], {
    enabled: !!session.data,
  })

  const { mutate: createTodo } = trpc.useMutation(['notes.create'], {
    onMutate(variables) {
      tctx.cancelQuery(['notes.getAll'])
      const newNote = {
        ...variables,
        userId: session!.data!.user!.id,
      } as Note
      tctx.setQueryData(['notes.getAll'], (data) => {
        if (!data) return [newNote]
        return [newNote, ...data]
      })

      return { newNote }
    },
    onSuccess() {
      tctx.invalidateQueries(['notes.getAll'])
    },
  })
  const { mutate: emptyTrash } = trpc.useMutation(['notes.deleteAllTrash'], {
    onMutate: () => {
      tctx.cancelQuery(['notes.getAll'])
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.status !== 'TRASHED'))
    },
    onSettled(data, variables, context) {
      tctx.invalidateQueries(['notes.getAll'])
    },
  })

  const [openNote, setOpenNote] = useState<Note | null>(null)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    z.string()
      .cuid()
      .safeParse(new Date().getTime().toString() + session.data?.user?.id.slice(0, 4))
    createTodo({
      id: cuid(),
      title: Math.random().toString(36).substring(2, 9),
      description: '',
      color: '#D8E2DC',
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const handleOpenNote = (note: Note) => {
    setOpenNote(note)
  }

  if (!session.data) return <Login />
  if (!notes.data) {
    return (
      <div className='flex h-screen flex-col items-center justify-center '>
        <AiOutlineLoading3Quarters className='h-10 w-10 animate-spin' />
      </div>
    )
  }

  return (
    <div className='flex h-full overflow-hidden'>
      {/**
       * Side Nav
       */}
      <div
        className={clsx(
          sideNavOpen ? 'w-64 after:min-w-[256px]' : 'w-10 min-w-[40px]',
          'flex h-full flex-col border-r transition-width'
        )}>
        <Button
          onClick={() => setSideNavOpen(!sideNavOpen)}
          className='rounded-none border-b px-2 py-4 hover:bg-slate-100'>
          <BiMenuAltLeft className='h-6 w-6' />
        </Button>
        <div className='flex h-full w-full flex-col justify-between'>
          <div>
            <Button
              onClick={() => setIsTrashOpen(false)}
              className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
              <TbNotes className='min-h-[24px] min-w-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>All Notes</span>
            </Button>
            <Button
              onClick={() => setIsTrashOpen(true)}
              className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
              <HiOutlineTrash className='min-h-[24px] min-w-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>Trash</span>
            </Button>
          </div>
          <div>
            <Button
              className='flex w-full cursor-pointer items-center gap-2 border-y py-2 px-2 hover:bg-slate-100'
              onClick={() => {
                signOut()
              }}>
              <MdLogout className='min-h-[24px] min-w-[24px]' />
              {sideNavOpen && <span className='overflow-hidden whitespace-nowrap'>Log Out</span>}
            </Button>
            {sideNavOpen && <p className='overflow-hidden whitespace-nowrap p-2'>Made by dvries </p>}
          </div>
        </div>
      </div>
      {/**
       * Main Content Nav
       */}
      <div className='relative flex h-full w-full flex-col md:w-80 md:min-w-[320px] md:max-w-xs md:border-r lg:w-96 lg:min-w-[384px] lg:max-w-sm'>
        <div className='flex items-center justify-between border-b p-2'>
          <div className='w-10 p-2' />
          {isTrashOpen ? <div>Trash</div> : <div>My notes</div>}
          <Button className='w-fit bg-transparent px-2 py-2' onClick={handleCreateTodo}>
            <TbEdit className='h-6 w-6' />
          </Button>
        </div>
        <span onClick={() => searchRef.current?.focus()} className='relative cursor-text'>
          <BiSearchAlt className='absolute inset-y-0 left-4 my-auto h-6 w-6' />
          <input
            ref={searchRef}
            className='w-full border-b py-2 pl-12 pr-4 outline-none placeholder:italic'
            placeholder='Search notes'
          />
        </span>
        <AutoAnimate className='relative flex h-full max-h-full w-full flex-col overflow-y-auto'>
          {!isTrashOpen ? (
            <>
              {notes.data.filter((note) => note.status === 'IN_PROGRESS').length > 0 ? (
                notes.data
                  .filter((note) => note.status === 'IN_PROGRESS')
                  .map((note) => <NoteTile key={note.id} note={note} onClick={() => handleOpenNote(note)} />)
              ) : (
                <div className='m-auto'>No notes.</div>
              )}
            </>
          ) : (
            <>
              {notes.data.filter((note) => note.status === 'TRASHED').length > 0 ? (
                notes.data
                  .filter((note) => note.status === 'TRASHED')
                  .map((note) => <NoteTile key={note.id} note={note} onClick={() => handleOpenNote(note)} />)
              ) : (
                <div className='m-auto'>Trash is empty.</div>
              )}
            </>
          )}
        </AutoAnimate>
        {isTrashOpen && (
          <Button
            className='mt-auto h-fit w-full rounded-none border-t bg-white py-4 hover:bg-slate-100'
            onClick={() => emptyTrash()}>
            Empty Trash
          </Button>
        )}
      </div>
      {/**
       * Editor
       */}
      {notes.data && openNote && <NoteEditor note={openNote} setOpenNote={setOpenNote} />}
    </div>
  )
}

interface EditorProps {
  note: Note
  setOpenNote: (note: Note | null) => void
}

const NoteEditor: React.FC<EditorProps> = ({ note, setOpenNote }) => {
  const tctx = trpc.useContext()

  const { mutate: deleteNote } = trpc.useMutation(['notes.delete'], {
    onMutate: ({ id }) => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.id !== id))
    },
  })
  const { mutate: trashNote } = trpc.useMutation(['notes.trash'], {
    onMutate: ({ id }) => {
      tctx.setQueryData(['notes.getAll'], (oldData) =>
        oldData!.map((n) => (n.id === id ? { ...n, status: 'TRASHED' } : n))
      )
    },
  })
  const { mutate: updateNote } = trpc.useMutation(['notes.update'], {
    onMutate: ({ id, title, description, color }) => {
      tctx.setQueryData(['notes.getAll'], (oldData) =>
        oldData!.map((n) =>
          n.id === id
            ? { ...n, title: title || n.title, description: description || n.description, color: color || n.color }
            : { ...n }
        )
      )
    },
  })

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const colorTimeout = useRef<NodeJS.Timeout | null>(null)
  const [desc, setDesc] = useState(note.description || '')
  const [color, setColor] = useState(note.color)
  const [openColorPicker, setOpenColorPicker] = useState(false)

  // Update note when typing, set timeout to avoid too many requests
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    let id = note.id
    let title = note.title
    let description = e.target.value
    setDesc(e.target.value)
    tctx.setQueryData(['notes.getAll'], (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, description: e.target.value, updatedAt: new Date() } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
    typingTimeout.current = setTimeout(() => {
      updateNote({ id, title, description })
      console.log('update', note.id, id, desc)
    }, 500)
  }

  // update note color
  const handleColor = (color: string) => {
    if (colorTimeout.current) clearTimeout(colorTimeout.current)
    setColor(color)
    tctx.setQueryData(['notes.getAll'], (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, color, updatedAt: new Date() } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
    colorTimeout.current = setTimeout(() => {
      updateNote({ id: note.id, color: color })
    }, 500)
  }

  //Update states when selecting another note
  useEffect(() => {
    setDesc(note.description || '')
    setColor(note.color)
    setOpenColorPicker(false)
  }, [note])

  return (
    <div className='absolute inset-0 z-50 flex w-full flex-col bg-white md:relative'>
      <div className='flex justify-between border-b bg-white p-2'>
        <Button className='w-fit bg-slate-200' onClick={() => setOpenNote(null)}>
          Close
        </Button>
        <Button
          className='w-fit bg-slate-200'
          onClick={() => {
            note.status === 'TRASHED' ? deleteNote({ id: note.id }) : trashNote({ id: note.id })
            setOpenNote(null)
          }}>
          <FaTrash />
        </Button>
      </div>
      <div className='relative h-full py-2 px-4'>
        <div className='text-2xl'>{note.title}</div>
        <textarea className='w-full outline-none' rows={4} onChange={(e) => onTextChange(e)} value={desc}></textarea>
      </div>
      {openColorPicker && <HexColorPicker className='absolute' color={color} onChange={handleColor} />}
      <div className='relative h-10 border-t'>
        <div className='peer-target: relative flex w-fit gap-2 p-2'>
          <div onClick={() => handleColor('#fff24b')} className='h-6 w-6 rounded border bg-[#fff24b]'></div>
          <div onClick={() => handleColor('#66a3ff')} className='h-6 w-6 rounded border bg-[#66a3ff]'></div>
          <div onClick={() => handleColor('#ff215d')} className='h-6 w-6 rounded border bg-[#ff215d]'></div>
          <div onClick={() => handleColor('#a940fc')} className='h-6 w-6 rounded border bg-[#a940fc]'></div>
          <div onClick={() => handleColor('#58ff4a')} className='h-6 w-6 rounded border bg-[#58ff4a]'></div>
          <div
            onClick={() => {
              setOpenColorPicker(!openColorPicker)
            }}>
            <AiOutlinePlus className='h-6 w-6' />
          </div>
        </div>
      </div>
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
      session: await getUnstableSession(ctx),
    },
  }
}

export default Home
