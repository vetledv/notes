import { cn } from '~/utils/cn'

export function Button({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button className={cn(className, 'rounded px-4 py-2', !className && 'bg-slate-200')} {...props}>
			{children}
		</button>
	)
}
