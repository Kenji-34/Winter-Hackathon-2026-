import { useEffect, useState } from 'react'
import Homepage from './Homepage.jsx'
import Mcq from './Mcq.jsx'
import Format from './Format.jsx'

export default function Router() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleRouteChange = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  if (route === '#/mcq') return <Mcq />
  if (route === '#/format') return <Format />
  return <Homepage />
}
