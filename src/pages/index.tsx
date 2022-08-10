import clsx from 'clsx'
import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useState } from 'react'
import { FaDiscord } from 'react-icons/fa'
import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import { inferQueryOutput, trpc } from '../utils/trpc'

type Note = inferQueryOutput<'notes.getAll'>[0]

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string
  note: Note
}

const NoteTile: React.FC<NoteProps> = ({ note, ...props }) => {
  const tctx = trpc.useContext()
  const { mutate: deleteNote } = trpc.useMutation(['notes.delete'], {
    onMutate: ({ id }) => {
      tctx.setQueryData(['notes.getAll'], (oldData) => oldData!.filter((n) => n.id !== id))
    },
  })
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
  const handleDelete = () => {
    deleteNote({ id: note.id })
  }

  return (
    <div key={note.id} {...props} className=' border-b h-fit cursor-pointer'>
      <div className='p-2 font-semibold'>{note.title}</div>
      <div className='p-2 font-thin'>{note.description}</div>
    </div>
  )
}

const HomeContent: React.FC = () => {
  const session = useSession()
  const notes = trpc.useQuery(['notes.getAll'], {
    enabled: !!session.data,
  })
  const tctx = trpc.useContext()

  const { mutate: createTodo } = trpc.useMutation(['notes.create'], {
    onSuccess: (data, variables, context) => {
      console.log('createTodo success', data, variables, context)
      tctx.setQueryData(['notes.getAll'], (prev) => (prev ? [...prev, data] : [data]))
    },
  })
  const [isOpen, setIsOpen] = useState<string | null>(null)

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
    <div className='grid gap-2 md:grid-cols-2 items-start group min-h-full'>
      <div className={clsx(isOpen && 'hidden', 'md:block')}>
        <input className='px-4 py-3 border-b w-full' placeholder='Search notes'></input>
        <Button onClick={handleCreateTodo}>New Note</Button>
        {notes.data ? (
          <AutoAnimate className='grid w-full'>
            {notes.data.map((note) => (
              <NoteTile
                key={note.id}
                note={note}
                onClick={() => {
                  setIsOpen(note.id)
                  console.log('OPENING:', note.id)
                }}
              />
            ))}
          </AutoAnimate>
        ) : (
          <div>No Notes</div>
        )}
      </div>
      {isOpen && (
        <div className='bg-red-200 w-full h-full flex flex-col'>
          <Button className='w-fit bg-slate-200' onClick={() => setIsOpen(null)}>
            Close
          </Button>
          <div>{notes.data?.find((note) => note.id === isOpen)?.id}</div>
          <div>{notes.data?.find((note) => note.id === isOpen)?.title}</div>
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
      <div>
        <HomeContent />
      </div>
    </>
  )
}

export default Home
