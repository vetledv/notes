import { HTMLAttributes } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'

type AutoAnimateProps = HTMLAttributes<HTMLElement> & {
	as?: React.ElementType
}

export function AutoAnimate({ as: Card = 'div', children, ...props }: AutoAnimateProps) {
	const [parent] = useAutoAnimate()
	return (
		<Card {...props} ref={parent}>
			{children}
		</Card>
	)
}
