import AutoAnimate from '@/components/auto-animate'
import { BiMenuAltLeft, BiSearchAlt } from 'react-icons/bi'
import { HiOutlineTrash } from 'react-icons/hi'
import { MdLogout } from 'react-icons/md'
import { TbEdit, TbNotes } from 'react-icons/tb'
import { Button } from './button'

const LoadingNote = () => {
  return (
    <div className='relative flex h-20 min-h-[5.1rem] w-full items-center border-b before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-slate-400/10 before:bg-gradient-to-r before:from-transparent before:via-slate-400/10 before:to-transparent'>
      <div className='absolute left-0 z-10 h-full w-2 min-w-[8px] bg-slate-400' />
      <div className='relative w-full space-y-3 pl-4'>
        <div className='h-4 w-3/5 rounded-lg bg-slate-500/20'></div>
        <div className='h-4 w-4/5 rounded-lg bg-slate-500/10'></div>
      </div>
    </div>
  )
}

const LoadingSkeleton = () => {
  const loadingNotes = () => {
    let notes: JSX.Element[] = []
    for (let i = 0; i < 5; i++) {
      notes.push(<LoadingNote />)
    }
    return notes
  }

  return (
    <div className='flex min-h-screen w-full overflow-hidden'>
      <div className='flex h-full w-10 min-w-[40px] flex-col border-r transition-width'>
        <Button className='rounded-none border-b px-2 py-4 hover:bg-slate-100'>
          <BiMenuAltLeft className='h-6 w-6' />
        </Button>
        <div className='flex h-full w-full flex-col justify-between'>
          <div>
            <Button className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
              <TbNotes className='min-h-[24px] min-w-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>All Notes</span>
            </Button>
            <Button className='flex w-full items-center justify-start gap-2 rounded-none border-b px-2 hover:bg-slate-100'>
              <HiOutlineTrash className='min-h-[24px] min-w-[24px]' />
              <span className='overflow-hidden whitespace-nowrap'>Trash</span>
            </Button>
          </div>
          <Button className='flex w-full cursor-pointer items-center gap-2 rounded-none border-y py-2 px-2 hover:bg-slate-100'>
            <MdLogout className='min-h-[24px] min-w-[24px]' />
          </Button>
        </div>
      </div>
      <div className='relative flex h-full w-full flex-col md:w-80 md:min-w-[320px] md:max-w-xs md:border-r lg:w-96 lg:min-w-[384px] lg:max-w-sm'>
        <div className='flex items-center justify-between border-b p-2'>
          <div className='w-full text-center'>My notes</div>
          <Button className='w-fit bg-transparent px-2 py-2'>
            <TbEdit className='h-6 w-6' />
          </Button>
        </div>
        <span className='relative cursor-text'>
          <BiSearchAlt className='absolute inset-y-0 left-4 my-auto h-6 w-6' />
          <input
            className='w-full border-b py-2 pl-12 pr-4 outline-none placeholder:italic'
            placeholder='Search notes (not implemented)'
          />
        </span>
        <AutoAnimate className='relative flex h-full max-h-full w-full flex-col overflow-y-auto overflow-x-hidden'>
          {loadingNotes()}
        </AutoAnimate>
      </div>
    </div>
  )
}
export default LoadingSkeleton
