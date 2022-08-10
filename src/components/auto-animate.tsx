import { useAutoAnimate } from '@formkit/auto-animate/react'
import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

const AutoAnimate: React.FC<Props> = ({ as: Card = 'div', children, ...props }) => {
  const [parent] = useAutoAnimate()
  return (
    <Card {...props} ref={parent}>
      {children}
    </Card>
  )
}

export default AutoAnimate
