import { Note } from '@prisma/client'
import { useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { AiOutlinePlus } from 'react-icons/ai'
import { FaTrash } from 'react-icons/fa'
import { Button } from './button'
import { api } from '~/utils/api'
import { NoteFilters } from '~/utils/note-filter'
import { useClickOutside } from '~/hooks/use-click-outside'

interface EditorProps {
  note: Note
  onClose: () => void
}

export const NoteEditor: React.FC<EditorProps> = ({ note, onClose }) => {
  const tctx = api.useContext()

  const { mutate: deleteNote } = api.notes.deleteOneTrashed.useMutation({
    onMutate: ({ id }) => {
      tctx.notes.getAll.setData(undefined, (oldData) => oldData?.filter((note) => note.id !== id))
    },
  })
  const { mutate: trashNote } = api.notes.trash.useMutation({
    onMutate: ({ id }) => {
      tctx.notes.getAll.setData(undefined, (oldData) =>
        oldData?.map((note) => (note.id === id ? { ...note, status: NoteFilters.TRASHED } : note))
      )
    },
  })
  const { mutate: updateNote } = api.notes.update.useMutation({
    onMutate: ({ id, title, description, color }) => {
      tctx.notes.getAll.setData(undefined, (oldData) =>
        oldData?.map((note) =>
          note.id === id
            ? {
                ...note,
                title: title || note.title,
                description: description || note.description,
                color: color || note.color,
              }
            : note
        )
      )
    },
  })

  const colorSelectRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const colorTimeout = useRef<NodeJS.Timeout | null>(null)

  const [title, setTitle] = useState(note.title || '')
  const [desc, setDesc] = useState(note.description || '')

  const [color, setColor] = useState(note.color)
  const [openColorPicker, setOpenColorPicker] = useState(false)

  useClickOutside(colorSelectRef, () => setOpenColorPicker(false))

  // Update note when typing, set timeout to avoid too many requests
  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, type: 'title' | 'desc') => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    let id = note.id
    let t = type === 'title' ? e.target.value : title
    let d = type === 'desc' ? e.target.value : desc
    setTitle(t)
    setDesc(d)
    tctx.notes.getAll.setData(undefined, (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, title: t, description: d, updatedAt: new Date() } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
    typingTimeout.current = setTimeout(() => {
      updateNote({ id, title: t, description: d })
      console.log('update', note.id, id, desc)
    }, 500)
  }

  // update note color
  const handleColor = (color: string) => {
    if (colorTimeout.current) clearTimeout(colorTimeout.current)
    setColor(color)
    tctx.notes.getAll.setData(undefined, (oldData) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, color, updatedAt: new Date() } : n))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    )
    colorTimeout.current = setTimeout(() => {
      updateNote({ id: note.id, color: color })
    }, 500)
  }

  return (
    <main className='absolute inset-0 z-50 flex w-full flex-col bg-white md:relative'>
      <div className='flex justify-between border-b bg-white p-2'>
        <Button className='w-fit bg-slate-200' onClick={onClose}>
          Close
        </Button>
        <Button
          className='w-fit bg-slate-200'
          onClick={() => {
            note.status === NoteFilters.TRASHED ? deleteNote({ id: note.id }) : trashNote({ id: note.id })
            onClose()
          }}>
          <FaTrash />
        </Button>
      </div>
      <div className='relative h-full space-y-2 py-2 px-4'>
        <input
          className='h-fit w-full text-2xl outline-none'
          placeholder='Title'
          value={title}
          onChange={(e) => onTextChange(e, 'title')}></input>
        <textarea
          className='h-[90%] w-full resize-none outline-none'
          rows={5}
          onChange={(e) => onTextChange(e, 'desc')}
          value={desc}></textarea>
      </div>
      {openColorPicker && (
        <div ref={colorSelectRef} className='h-fit w-fit'>
          <HexColorPicker className={'absolute z-50'} color={color} onChange={handleColor} />
        </div>
      )}
      <div className='relative h-10 border-t'>
        <div className='relative flex w-fit gap-2 p-2'>
          <div onClick={() => handleColor('#fff24b')} className='h-6 w-6 rounded border bg-[#fff24b]'></div>
          <div onClick={() => handleColor('#66a3ff')} className='h-6 w-6 rounded border bg-[#66a3ff]'></div>
          <div onClick={() => handleColor('#ff215d')} className='h-6 w-6 rounded border bg-[#ff215d]'></div>
          <div onClick={() => handleColor('#a940fc')} className='h-6 w-6 rounded border bg-[#a940fc]'></div>
          <div onClick={() => handleColor('#58ff4a')} className='h-6 w-6 rounded border bg-[#58ff4a]'></div>
          <div
            className='cursor-pointer'
            onClick={() => {
              setOpenColorPicker(!openColorPicker)
            }}>
            <AiOutlinePlus className='h-6 w-6' />
          </div>
        </div>
      </div>
    </main>
  )
}
