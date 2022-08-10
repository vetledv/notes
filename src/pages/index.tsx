import type { NextPage } from 'next'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { FaDiscord } from 'react-icons/fa'
import AutoAnimate from '../components/auto-animate'
import { Button } from '../components/button'
import { inferQueryOutput, trpc } from '../utils/trpc'

type Note = inferQueryOutput<'notes.getAll'>[0]

const NoteTile: React.FC<{ note: Note }> = ({ note }) => {
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
    <div key={note.id} className={' bg-slate-300 rounded overflow-hidden'}>
      <div
        className='p-2'
        style={{
          //this does for some reason not work with tailwind bg-[${todo.color}], so I have to do style instead
          backgroundColor: note.color,
          color: calculateTextColor(),
        }}>
        {note.title}
      </div>
      <div className='px-2'>
        <div>{note.description}</div>
        <div>{note.color}</div>
        <div>{note.createdAt.toLocaleDateString()}</div>
        <div className='cursor-pointer' onClick={handleDelete}>
          Remove
        </div>
      </div>
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
    <div className='flex flex-col gap-2 items-start'>
      <div>Howdy, {session.data.user?.name}</div>
      <Button onClick={() => signOut()}>Log out</Button>
      <Button onClick={handleCreateTodo}>New Note</Button>
      {notes.data ? (
        <AutoAnimate className='grid md:grid-cols-2 lg:grid-cols-3 gap-2'>
          {notes.data.map((note) => (
            <NoteTile key={note.id} note={note} />
          ))}
        </AutoAnimate>
      ) : (
        <div>No Notes</div>
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
