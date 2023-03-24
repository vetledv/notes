import { RefObject, useEffect } from 'react'

/**
 * detect click outside of ref element
 * @param ref reference to the element wrapper to listen to
 * @param handler function to call when clicked outside of the ref
 */
export const useClickOutside = (ref: RefObject<any>, handler: () => void) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler()
      }
    }
    document.addEventListener('mousedown', handleClickOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handler, ref])
}
