import { useEffect, useState } from 'react'

export function useWindowSize() {
  const [size, setSize] = useState(window.innerWidth)
  useEffect(() => {
    function updateSize() {
      if (window.innerWidth !== size) setSize(window.innerWidth)
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
    // eslint-disable-next-line
  }, [])
  return size
}
