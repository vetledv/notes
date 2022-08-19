import { trpc } from '@/utils/trpc'
import { Note } from '@prisma/client'
import { useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { AiOutlinePlus } from 'react-icons/ai'
import { FaTrash } from 'react-icons/fa'
import { Button } from './button'

interface EditorProps {
  note: Note
  setOpenNote: (id: string | null) => void
}

const NoteEditor: React.FC<EditorProps> = ({ note, setOpenNote }) => {
  const tctx = trpc.useContext()

  const { mutate: deleteNote } = trpc.useMutation(['notes.deleteOneTrashed'], {
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
export default NoteEditor
