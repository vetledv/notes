import clsx from 'clsx'
import type { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useRef, useState } from 'react'
import { FaDiscord, FaTrash } from 'react-icons/fa'
import { TbEdit } from 'react-icons/tb'
import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import { inferQueryOutput, trpc } from '../utils/trpc'
import { BiSearchAlt } from 'react-icons/bi'
import { FiMoreVertical } from 'react-icons/fi'
import dynamic from 'next/dynamic'

enum Status {
  TRASHED = 'TRASHED',
  IN_PROGRESS = 'IN_PROGRESS',
}

type Note = inferQueryOutput<'notes.getAll'>[0]

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string
  note: Note
}

const NoteTile: React.FC<NoteProps> = ({ note, ...props }) => {
  const tctx = trpc.useContext()
  /**
   * @link https://stackoverflow.com/a/3943023
   */
  const calculateTextColor = () => {
    const red = parseInt(note.color.slice(1, 3), 16) / 255
    const green = parseInt(note.color.slice(3, 5), 16) / 255
    const blue = parseInt(note.color.slice(5, 7), 16) / 255
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000
    return brightness > 0.5 ? '#000' : '#fff'
  }
  const [title, setTitle] = useState(note.title)
  const [color, setColor] = useState(note.color)

  return (
    <div key={note.id} {...props} className=' border-b h-fit cursor-pointer'>
      <div className='p-2 font-semibold'>{note.title}</div>
      <div className='p-2 font-thin'>{note.description}</div>
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
      tctx.setQueryData(['notes.getAll'], (prev) => (prev ? [...prev, data] : [data]))
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
        //find the note with the id and set it to trashed
        oldData!.map((n) => (n.id === id ? { ...n, status: Status.TRASHED } : n))
      )
    },
  })

  const { mutate: emptyTrash } = trpc.useMutation(['notes.deleteAllTrash'], {
    onMutate: () => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.status !== Status.TRASHED))
    },
  })

  const [isNoteOpen, setIsOpen] = useState<string | null>(null)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    createTodo({
      title: 'Another New Todo',
      description: 'This is another new todo',
      color: '#063F4B',
    })
  }

  if (!session.data) {
    return (
      <Button
        onClick={() => {
          signIn('discord')
        }}
        className='flex gap-2 items-center bg-[#37393e] text-[#dcddde]'>
        Log in with Discord
        <FaDiscord className='h-6 w-6' />
      </Button>
    )
  }
  if (notes.isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div className='grid gap-2 md:grid-cols-2 items-start overflow-hidden relative'>
      <div className={clsx(isNoteOpen && 'hidden', 'md:block', 'bg-pink-300 relative')}>
        <nav className='relative border-b p-2 flex justify-between items-center'>
          {isTrashOpen ? (
            <>
              <div>Trash</div>
              <Button onClick={() => setIsTrashOpen(false)}>My notes</Button>
            </>
          ) : (
            <>
              <div>My notes</div>
              <Button onClick={() => setIsTrashOpen(true)}>
                <FaTrash />
              </Button>
            </>
          )}
          <Button className='bg-transparent' onClick={handleCreateTodo}>
            <TbEdit className='w-6 h-6' />
          </Button>
        </nav>
        <div onClick={() => searchRef.current?.focus()} className='relative bg-red-200 cursor-text '>
          <BiSearchAlt className='w-6 h-6 absolute my-auto inset-y-0 left-4' />
          <input ref={searchRef} className='pl-12 pr-4 py-3 border-b w-full' placeholder='Search notes'></input>
        </div>
        {notes.data ? (
          <AutoAnimate className='grid w-full  h-full max-h-full overflow-y-scroll'>
            {!isTrashOpen ? (
              notes.data
                .filter((note) => note.status !== Status.TRASHED)
                .map((note) => (
                  <NoteTile
                    key={note.id}
                    note={note}
                    onClick={() => {
                      setIsOpen(note.id)
                      console.log('OPENING:', note.id)
                    }}
                  />
                ))
            ) : (
              <>
                {notes.data
                  .filter((note) => note.status === Status.TRASHED)
                  .map((note) => (
                    <NoteTile
                      key={note.id}
                      note={note}
                      onClick={() => {
                        setIsOpen(note.id)
                      }}
                    />
                  ))}
                <Button onClick={()=>emptyTrash()}>Empty Trash</Button>
              </>
            )}
          </AutoAnimate>
        ) : (
          <div>No Notes</div>
        )}
      </div>
      {isNoteOpen && (
        <div className='bg-red-200 w-full h-full flex flex-col'>
          <Button className='w-fit bg-slate-200' onClick={() => setIsOpen(null)}>
            Close
          </Button>
          <Button
            className='w-fit bg-slate-200'
            onClick={() => {
              isTrashOpen ? deleteNote({ id: isNoteOpen }) : trashNote({ id: isNoteOpen })
              setIsOpen(null)
            }}>
            <FaTrash />
          </Button>
          <div>{notes.data?.find((note) => note.id === isNoteOpen)?.id}</div>
          <div contentEditable='true'>{notes.data?.find((note) => note.id === isNoteOpen)?.title}</div>
        </div>
      )}
    </div>
  )
}

const Home: NextPage = () => {
  const session = useSession()

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
