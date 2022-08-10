import clsx from 'clsx'

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}
export const Button: React.FC<BtnProps> = ({ children, className, ...props }) => (
  <button className={clsx(className, ' px-4 py-2 rounded', !className && 'bg-slate-200')} {...props}>
    {children}
  </button>
)
