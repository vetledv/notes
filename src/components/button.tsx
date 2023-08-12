import clsx from 'clsx'

export function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(className, 'rounded px-4 py-2', !className && 'bg-slate-200')} {...props}>
      {children}
    </button>
  )
}
