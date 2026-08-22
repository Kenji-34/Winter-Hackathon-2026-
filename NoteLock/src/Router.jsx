import { useEffect, useState } from 'react'
import Homepage from './Homepage.jsx'
import Mcq from './Mcq.jsx'

export default function Router() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleRouteChange = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  return route === '#/mcq' ? <Mcq /> : <Homepage />
}
