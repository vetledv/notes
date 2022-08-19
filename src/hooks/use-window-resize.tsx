import { useEffect, useState } from 'react'

interface State {
  width: number | undefined
  height: number | undefined
}

/**
 * Hook to get the current window size
 * @param deps useEffect dependencies
 */
const useWindowResize = (deps: any[]) => {
  const [windowSize, setWindowSize] = useState<State>({
    width: undefined,
    height: undefined,
  })
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])

  return windowSize
}

export default useWindowResize
