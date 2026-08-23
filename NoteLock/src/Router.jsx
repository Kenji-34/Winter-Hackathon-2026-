import { useEffect, useState } from 'react'
import Homepage from './Homepage.jsx'
import Mcq from './Mcq.jsx'
import Format from './Format.jsx'
import Note from './Note.jsx'
import Folder from './Folder.jsx'
import Capture from './Capture.jsx'

export default function Router() {
  const [route, setRoute] = useState(window.location.hash)

  useEffect(() => {
    const handleRouteChange = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', handleRouteChange)
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  if (route === '#/capture') return <Capture />
  if (route === '#/mcq') return <Mcq />
  if (route === '#/result') return <Mcq showCompletedResult />
  if (route === '#/format') return <Format />
  if (route.startsWith('#/note/')) {
    const id = route.slice('#/note/'.length)
    return <Note key={id} id={id} />
  }
  if (route.startsWith('#/folder/')) {
    const id = route.slice('#/folder/'.length)
    return <Folder key={id} subjectId={id} />
  }
  return <Homepage />
}
