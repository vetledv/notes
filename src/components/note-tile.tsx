import type { Note } from '@prisma/client'

interface NoteProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string
  note: Note
}

const NoteTile: React.FC<NoteProps> = ({ note, ...props }) => {
  /**
   * @link https://stackoverflow.com/a/3943023
   */
  // const calculateTextColor = () => {
  //   const red = parseInt(note.color.slice(1, 3), 16) / 255
  //   const green = parseInt(note.color.slice(3, 5), 16) / 255
  //   const blue = parseInt(note.color.slice(5, 7), 16) / 255
  //   const brightness = (red * 299 + green * 587 + blue * 114) / 1000
  //   return brightness > 0.5 ? '#000' : '#fff'
  // }
  // const [title, setTitle] = useState(note.title)
  // const [color, setColor] = useState(note.color)

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

export default NoteTile
