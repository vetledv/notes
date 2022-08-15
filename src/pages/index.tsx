import type { Note } from '@prisma/client'
import clsx from 'clsx'
import type { NextPage } from 'next'
import { signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
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
import { HexColorPicker } from 'react-colorful'
interface EditorProps {
  note: Note
  setOpenNote: (note: Note | null) => void
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
  const { mutate: emptyTrash } = trpc.useMutation(['notes.deleteAllTrash'], {
    onMutate: () => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.status !== 'TRASHED'))
    },
  })

  const [openNote, setOpenNote] = useState<Note | null>(null)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    createTodo({
      title: 'New Todo',
      description: null,
      color: '#9BA2FF',
    })
  }

  const handleOpenNote = (note: Note) => {
    setOpenNote(note)
  }

  if (!session.data) return <Login />
  if (notes.isLoading) return <div>Loading...</div>

  return (
    <div className='flex overflow-hidden h-screen'>
      {/**
       * Side Nav
       */}
      <div className={clsx(sideNavOpen ? 'w-64 after:min-w-[256px]' : 'w-10 min-w-[40px]', 'h-full  flex flex-col border-r transition-width duration-1000')}>
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
              <TbNotes className='min-w-[24px] min-h-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>All Notes</span>
            </Button>
            <Button
              onClick={() => setIsTrashOpen(true)}
              className='rounded-none w-full flex px-2 gap-2 justify-start items-center hover:bg-slate-100 border-b'>
              <HiOutlineTrash className='min-w-[24px] min-h-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>Trash</span>
            </Button>
          </div>
          <div>
            <Button
              className='cursor-pointer w-full flex items-center gap-2 py-2 px-2 hover:bg-slate-100'
              onClick={() => {
                signOut()
              }}>
              <MdLogout className='w-6 h-6' />
              {sideNavOpen && <span className='overflow-hidden whitespace-nowrap'>Log Out</span>}
            </Button>
            {sideNavOpen && <p className='p-2 overflow-hidden whitespace-nowrap'>Made by dvries </p>}
          </div>
        </div>
      </div>
      {/**
       * Main Content Nav
       */}
      <div className='h-full flex flex-col w-full md:max-w-xs lg:max-w-sm md:min-w-[320px] lg:min-w-[384px] md:w-80 lg:w-96 md:border-r relative'>
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
            className='pl-12 pr-4 py-2 border-b w-full outline-none'
            placeholder='Search notes'></input>
        </span>

        {notes.data ? (
          <AutoAnimate className='flex flex-col w-full h-full max-h-full overflow-y-auto relative'>
            {!isTrashOpen ? (
              <>
                {notes.data.filter((note) => note.status === 'IN_PROGRESS').length > 0 ? (
                  notes.data
                    .filter((note) => note.status === 'IN_PROGRESS')
                    .map((note) => <NoteTile key={note.id} note={note} onClick={() => handleOpenNote(note)} />)
                ) : (
                  <div>no notes</div>
                )}
              </>
            ) : (
              <>
                {notes.data.filter((note) => note.status === 'TRASHED').length > 0 ? (
                  notes.data
                    .filter((note) => note.status === 'TRASHED')
                    .map((note) => <NoteTile key={note.id} note={note} onClick={() => handleOpenNote(note)} />)
                ) : (
                  <div>trash empty</div>
                )}
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
      {notes.data && openNote && <NoteEditor note={openNote} setOpenNote={setOpenNote} />}
    </div>
  )
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

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    let id = note.id
    let title = note.title
    let description = e.target.value
    setDesc(e.target.value)
    typingTimeout.current = setTimeout(() => {
      updateNote({ id, title, description })
      console.log('update', note.id, id, desc)
    }, 500)
    tctx.setQueryData(['notes.getAll'], (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, description: e.target.value, updatedAt: new Date() } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
  }

  const onColorChange = (color: string) => {
    if (colorTimeout.current) clearTimeout(colorTimeout.current)
    let _color = color
    setColor(color)
    colorTimeout.current = setTimeout(() => {
      updateNote({ id: note.id, title: note.title, description: note.description, color: _color })
    }, 500)
    tctx.setQueryData(['notes.getAll'], (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, color } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
  }

  //Update state when selecting another note
  useEffect(() => {
    setDesc(note.description || '')
    setColor(note.color)
  }, [note.color, note.description])

  return (
    <div className='flex flex-col w-full absolute md:relative inset-0 bg-white z-50'>
      <div className='flex justify-between p-2 border-b bg-white'>
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
      <div className='py-2 px-4 h-full relative'>
        <div>{note.id}</div>
        <div className='text-2xl'>{note.title}</div>
        <textarea className='w-full outline-none' onChange={(e) => onTextChange(e)} value={desc}></textarea>
        <HexColorPicker color={color} onChange={onColorChange} />
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

export default Home
