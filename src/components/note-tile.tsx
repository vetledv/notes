import type { Note } from '@prisma/client'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  note: Note
}

export function NoteTile({ note, ...props }: NoteProps) {
  return (
    <div
      key={note.id}
      {...props}
      className='relative flex h-20 min-h-[5rem] w-full cursor-pointer border-b hover:bg-slate-100'>
      <div
        className='absolute left-0 z-10 h-full w-2 min-w-[8px]'
        style={{
          backgroundColor: note.color,
        }}
      />
      <div className='relative flex w-full flex-col pl-2 '>
        <div className='p-2 font-semibold'>{note.title}</div>
        <div className='absolute bottom-0 left-0 w-full overflow-hidden text-ellipsis whitespace-nowrap py-2 px-5 font-thin'>
          {note.description}
        </div>
      </div>
    </div>
  )
}
