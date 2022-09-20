import useClickOutside from '@/hooks/use-click-outside'
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

  const { mutate: deleteNote } = trpc.notes.deleteOneTrashed.useMutation({
    onMutate: ({ id }) => {
      tctx.notes.getAll.setData((oldData: Note[] | []) => oldData!.filter((n: { id: string }) => n.id !== id))
    },
  })
  const { mutate: trashNote } = trpc.notes.trash.useMutation({
    onMutate: ({ id }) => {
      tctx.notes.getAll.setData((oldData: Note[] | []) =>
        oldData!.map((n: { id: any }) => (n.id === id ? { ...n, status: 'TRASHED' } : n))
      )
    },
  })
  const { mutate: updateNote } = trpc.notes.update.useMutation({
    onMutate: ({ id, title, description, color }) => {
      tctx.notes.getAll.setData((oldData: Note[] | []) =>
        oldData!.map((n) =>
          n.id === id
            ? { ...n, title: title || n.title, description: description || n.description, color: color || n.color }
            : { ...n }
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
    tctx.notes.getAll.setData((oldData: Note[] | []) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, title: t, description: d, updatedAt: new Date() } : n))
        .sort(
          (a: { updatedAt: { getTime: () => number } }, b: { updatedAt: { getTime: () => number } }) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
        )
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
    tctx.notes.getAll.setData((oldData: Note[] | []) =>
      oldData!
        .map((n) => (n.id === note.id ? { ...n, color, updatedAt: new Date() } : n))
        .sort(
          (a: { updatedAt: { getTime: () => number } }, b: { updatedAt: { getTime: () => number } }) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
        )
    )
    colorTimeout.current = setTimeout(() => {
      updateNote({ id: note.id, color: color })
    }, 500)
  }

  //Reset states when selecting another note
  useEffect(() => {
    setDesc(note.description || '')
    setColor(note.color)
    setOpenColorPicker(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id])

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
      <div className='relative h-full space-y-2 py-2 px-4'>
        <input
          className='h-fit w-full bg-slate-100 text-2xl outline-none'
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
    </div>
  )
}
export default NoteEditor
