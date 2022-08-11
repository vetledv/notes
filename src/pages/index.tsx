import type { Note } from '@prisma/client'
import clsx from 'clsx'
import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRef, useState } from 'react'
import { BiMenuAltLeft, BiSearchAlt } from 'react-icons/bi'
import { FaDiscord, FaTrash } from 'react-icons/fa'
import { MdLogout } from 'react-icons/md'
import { TbEdit, TbNotes } from 'react-icons/tb'
import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import NoteTile from '../components/note-tile'
import { trpc } from '../utils/trpc'
import { HiOutlineTrash } from 'react-icons/hi'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string
  note: Note
}

const Login = () => {
  return (
    <div className='flex flex-col h-screen items-center gap-4 justify-center'>
      <div className='flex flex-col gap-4'>
        <div>
          <div className='text-7xl font-bold border-b w-fit'>Notes.</div>
          <div className='text-2xl font-bold border-b w-fit'>That&apos;s it. Just your notes.</div>
        </div>
        <Button
          onClick={() => {
            signIn('discord')
          }}
          className='flex text-lg gap-2 w-fit py-4 justify-center items-center bg-[#37393e] text-[#dcddde]'>
          Log in with Discord
          <FaDiscord className='h-6 w-6' />
        </Button>
      </div>
    </div>
  )
}

const HomeContent: React.FC = () => {
  const session = useSession()
  const tctx = trpc.useContext()

  const notes = trpc.useQuery(['notes.getAll'], {
    enabled: !!session.data,
  })

  const { mutate: createTodo } = trpc.useMutation(['notes.create'], {
    onSuccess: (data, variables, context) => {
      console.log('createTodo success', data, variables, context)
      tctx.setQueryData(['notes.getAll'], (prev) => (prev ? [data, ...prev] : [data]))
    },
  })
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
  const { mutate: emptyTrash } = trpc.useMutation(['notes.deleteAllTrash'], {
    onMutate: () => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.status !== 'TRASHED'))
    },
  })

  const [isNoteOpen, setIsNoteOpen] = useState<string | null>(null)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    createTodo({
      title: 'New Todo',
      description: 'This is another new todo',
      color: '#9BA2FF',
    })
  }

  if (!session.data) return <Login />
  if (notes.isLoading) return <div>Loading...</div>

  return (
    <div className='flex overflow-hidden h-screen'>
      {/**
       * Side Nav
       */}
      <div className={clsx(sideNavOpen ? 'w-64' : ' w-0', 'h-full min-w-fit flex flex-col border-r transition-width')}>
        <Button
          onClick={() => setSideNavOpen(!sideNavOpen)}
          className='px-2 py-4 border-b rounded-none hover:bg-slate-100'>
          <BiMenuAltLeft className='w-6 h-6' />
        </Button>
        <div className='flex flex-col w-full h-full justify-between'>
          <div>
            <Button
              onClick={() => setIsTrashOpen(false)}
              className='rounded-none w-full flex px-2 gap-2 justify-start items-center hover:bg-slate-100 border-b'>
              <TbNotes className='w-6 h-6' />
              {sideNavOpen && <span>All Notes</span>}
            </Button>
            <Button
              onClick={() => setIsTrashOpen(true)}
              className='rounded-none w-full flex px-2 gap-2 justify-start items-center hover:bg-slate-100 border-b'>
              <HiOutlineTrash className='w-6 h-6' />
              {sideNavOpen && <span>Trash</span>}
            </Button>
          </div>
          <div>
            <Button
              className='cursor-pointer w-full flex items-center gap-2 py-2 px-2 hover:bg-slate-100'
              onClick={() => {
                signOut()
              }}>
              <MdLogout className='w-6 h-6' />
              {sideNavOpen && <span>Log Out</span>}
            </Button>
            {sideNavOpen && <p className='p-2'>Made by dvries </p>}
          </div>
        </div>
      </div>
      {/**
       * Main Content Nav
       */}
      <div className='h-full flex flex-col w-full z-30 md:max-w-xs lg:max-w-sm md:min-w-[320px] lg:min-w-[384px] md:w-80 lg:w-96 md:border-r'>
        <div className='border-b p-2 flex justify-between items-center'>
          <div className='w-10 p-2'></div>
          {isTrashOpen ? <div>Trash</div> : <div>My notes</div>}
          <Button className='bg-transparent w-fit px-2 py-2' onClick={handleCreateTodo}>
            <TbEdit className='w-6 h-6' />
          </Button>
        </div>
        <span onClick={() => searchRef.current?.focus()} className='relative cursor-text'>
          <BiSearchAlt className='w-6 h-6 absolute my-auto inset-y-0 left-4' />
          <input
            ref={searchRef}
            className='pl-12 pr-4 py-3 border-b w-full outline-none'
            placeholder='Search notes'></input>
        </span>

        {notes.data ? (
          <AutoAnimate className='flex flex-col w-full h-full max-h-full overflow-y-auto'>
            {!isTrashOpen ? (
              notes.data
                .filter((note) => note.status === 'IN_PROGRESS')
                .map((note) => (
                  <NoteTile
                    key={note.id}
                    note={note}
                    onClick={() => {
                      setIsNoteOpen(note.id)
                    }}
                  />
                ))
            ) : (
              <>
                {notes.data
                  .filter((note) => note.status === 'TRASHED')
                  .map((note) => (
                    <NoteTile
                      key={note.id}
                      note={note}
                      onClick={() => {
                        setIsNoteOpen(note.id)
                      }}
                    />
                  ))}
              </>
            )}
          </AutoAnimate>
        ) : (
          <div>No Notes</div>
        )}

        {isTrashOpen && (
          <Button className='bg-white rounded-none w-full h-fit mt-auto py-4 border-t' onClick={() => emptyTrash()}>
            Empty Trash
          </Button>
        )}
      </div>
      {/**
       * Editor
       */}
      {isNoteOpen && (
        <div className='flex flex-col w-full absolute md:relative inset-0 bg-white z-50'>
          <div className='flex justify-between p-2 border-b bg-white'>
            <Button className='w-fit bg-slate-200' onClick={() => setIsNoteOpen(null)}>
              Close
            </Button>
            <Button
              className='w-fit bg-slate-200'
              onClick={() => {
                isTrashOpen ? deleteNote({ id: isNoteOpen }) : trashNote({ id: isNoteOpen })
                setIsNoteOpen(null)
              }}>
              <FaTrash />
            </Button>
          </div>
          <div className='p-2'>
            <div>{notes.data?.find((note) => note.id === isNoteOpen)?.id}</div>
            <div>{notes.data?.find((note) => note.id === isNoteOpen)?.title}</div>
          </div>
        </div>
      )}
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

export default Home
