import type { NextPage } from 'next'
import { signIn, useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRef, useState } from 'react'
import { BiSearchAlt } from 'react-icons/bi'
import { FaDiscord, FaTrash } from 'react-icons/fa'
import { TbEdit } from 'react-icons/tb'
import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import { Nav } from '../components/nav'
import { inferQueryOutput, trpc } from '../utils/trpc'

enum Status {
  TRASHED = 'TRASHED',
  IN_PROGRESS = 'IN_PROGRESS',
}

type Note = inferQueryOutput<'notes.getAll'>[0]
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
  // const [title, setTitle] = useState(note.title)
  // const [color, setColor] = useState(note.color)

  return (
    <div key={note.id} {...props} className='hover:bg-slate-100 border-b h-fit cursor-pointer flex'>
      <div
        className='h-full w-2'
        style={{
          backgroundColor: note.color,
        }}
      />
      <div>
        <div className='p-2 font-semibold'>{note.title}</div>
        <div className='p-2 font-thin'>{note.description}</div>
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
        oldData!.map((n) => (n.id === id ? { ...n, status: Status.TRASHED } : n))
      )
    },
  })
  const { mutate: emptyTrash } = trpc.useMutation(['notes.deleteAllTrash'], {
    onMutate: () => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.status !== Status.TRASHED))
    },
  })

  const [isNoteOpen, setIsNoteOpen] = useState<string | null>(null)
  const [isTrashOpen, setIsTrashOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const handleCreateTodo = () => {
    createTodo({
      title: 'New Todo',
      description: 'This is another new todo',
      color: '#063F4B',
    })
  }

  if (!session.data) return <Login />
  if (notes.isLoading) return <div>Loading...</div>

  return (
    <div className='flex overflow-hidden h-screen'>
      <div className='h-full flex flex-col w-full z-30 md:max-w-xs lg:max-w-sm md:min-w-[320px] lg:min-w-[384px] md:w-80 lg:w-96 md:border-r'>
        <nav className='bg-white'>
          <Nav />
          <div className='border-b p-2 flex justify-between items-center'>
            <Button onClick={() => setIsTrashOpen(!isTrashOpen)}>{isTrashOpen ? <div>asd</div> : <FaTrash />}</Button>
            {isTrashOpen ? <div>Trash</div> : <div>My notes</div>}
            <Button className='bg-transparent' onClick={handleCreateTodo}>
              <TbEdit className='w-6 h-6' />
            </Button>
          </div>
          <span onClick={() => searchRef.current?.focus()} className='relative  cursor-text '>
            <BiSearchAlt className='w-6 h-6 absolute my-auto inset-y-0 left-4' />
            <input
              ref={searchRef}
              className='pl-12 pr-4 py-3 border-b w-full outline-none'
              placeholder='Search notes'></input>
          </span>
        </nav>

        {notes.data ? (
          <AutoAnimate className='flex flex-col w-full h-full max-h-full overflow-y-auto'>
            {!isTrashOpen ? (
              notes.data
                .filter((note) => note.status !== Status.TRASHED)
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
                  .filter((note) => note.status === Status.TRASHED)
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
