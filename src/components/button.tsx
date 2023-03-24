import clsx from 'clsx'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}
export const Button: React.FC<BtnProps> = ({ children, className, ...props }) => (
  <button className={clsx(className, 'rounded px-4 py-2', !className && 'bg-slate-200')} {...props}>
    {children}
  </button>
)
